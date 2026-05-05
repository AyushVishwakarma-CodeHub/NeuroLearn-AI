import React, { useState } from 'react';
import API_BASE, { authFetch } from '../config';
import './Store.css';

function Store({ user, gamification, setGamification }) {
  const [storeTab, setStoreTab] = useState('merch');
  const [message, setMessage] = useState('');

  // Physical merchandise (redeemable rewards)
  const [merchItems] = useState([
    { id: 'merch_tshirt', name: 'NeuroLearn T-Shirt', cost: 2000, image: '/images/tshirt.png', desc: 'Premium cotton, exclusive dark mode design' },
    { id: 'merch_mug', name: 'Coffee Mug', cost: 1000, image: '/images/mug.png', desc: '"Powered by AI" matte black mug' },
    { id: 'merch_notebook', name: 'Smart Notebook', cost: 800, image: '/images/notebook.png', desc: 'Premium leather-bound, 200 pages' },
    { id: 'merch_stickers', name: 'Sticker Pack', cost: 300, image: '/images/stickers.png', desc: '10 premium holographic tech stickers' },
    { id: 'merch_voucher_500', name: '₹500 Gift Voucher', cost: 3000, image: '/amazon_voucher.png', desc: 'Amazon / Flipkart digital gift card' },
    { id: 'merch_voucher_1000', name: '₹1000 Gift Voucher', cost: 5000, image: '/amazon_voucher.png', desc: 'Amazon / Flipkart digital gift card' },
    { id: 'merch_flashcards', name: 'Premium Flashcard Set', cost: 1500, image: '/flipcard_reward.png', desc: 'Physical premium study flashcard deck' },
  ]);

  // Digital perks (unlockable features)
  const [featureItems] = useState([
    { id: 'custom_timer', name: 'Custom Study Timer', cost: 100, icon: '⏱️', desc: 'Set personalized study intervals' },
    { id: 'advanced_analytics', name: 'Advanced Analytics', cost: 250, icon: '📊', desc: 'Detailed performance charts' },
    { id: 'premium_notifications', name: 'Smart Reminders', cost: 150, icon: '🔔', desc: 'AI-powered study reminders' },
    { id: 'ai_tutor_priority', name: 'AI Tutor Priority', cost: 500, icon: '🤖', desc: 'Skip the queue for AI help' },
  ]);

  if (!gamification) {
    return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading store...</div>;
  }

  const { xp, unlockedItems } = gamification;

  const handlePurchase = async (item) => {
    try {
      const response = await authFetch(`${API_BASE}/api/gamification/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`🎉 Successfully redeemed ${item.name}!`);
        setGamification(prev => ({
          ...prev,
          xp: data.xpRemaining,
          unlockedItems: data.unlockedItems
        }));
      } else {
        setMessage(`❌ ${data.error}`);
      }
      
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Network error. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="store-container">
      {message && <div className="store-toast">{message}</div>}

      <div className="store-hero glass-card">
        <div className="store-hero-content">
          <h2>NeuroLearn Rewards Store</h2>
          <p>Spend your hard-earned XP on exclusive digital perks and premium merchandise.</p>
        </div>
        <div className="store-hero-balance">
          <span>Your Balance</span>
          <div className="balance-amount">⭐ {xp} XP</div>
        </div>
      </div>

      <div className="store-tabs-wrapper">
        <button 
          className={`store-big-tab ${storeTab === 'merch' ? 'active' : ''}`}
          onClick={() => setStoreTab('merch')}
        >
          🎁 Merchandise
        </button>
        <button 
          className={`store-big-tab ${storeTab === 'features' ? 'active' : ''}`}
          onClick={() => setStoreTab('features')}
        >
          ⚡ Digital Perks
        </button>
      </div>

      {storeTab === 'merch' ? (
        <div className="merch-grid">
          {merchItems.map(item => {
            const canAfford = xp >= item.cost;
            return (
              <div key={item.id} className="merch-card glass-card">
                <div className="merch-image-container">
                  <img src={item.image} alt={item.name} className="merch-image" />
                </div>
                <div className="merch-details">
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                  <div className="merch-footer">
                    <span className="merch-price">⭐ {item.cost}</span>
                    <button 
                      className={`btn-purchase ${canAfford ? 'btn-primary' : 'btn-disabled'}`}
                      disabled={!canAfford}
                      onClick={() => handlePurchase(item)}
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="features-grid">
          {featureItems.map(item => {
            const isUnlocked = unlockedItems && unlockedItems.includes(item.id);
            const canAfford = xp >= item.cost;
            return (
              <div key={item.id} className={`feature-card glass-card ${isUnlocked ? 'unlocked' : ''}`}>
                <div className="feature-icon">{item.icon}</div>
                <div className="feature-info">
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                  <div className="feature-footer">
                    <span className="feature-price">{isUnlocked ? '✅ Unlocked' : `⭐ ${item.cost}`}</span>
                    {!isUnlocked && (
                      <button 
                        className={`btn-purchase ${canAfford ? 'btn-primary' : 'btn-disabled'}`}
                        disabled={!canAfford}
                        onClick={() => handlePurchase(item)}
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {storeTab === 'merch' && (
        <div className="shipping-note glass-card">
          <span className="note-icon">📦</span>
          <p>
            <strong>Shipping Information:</strong> Physical merchandise will be shipped to your registered email address for address confirmation. 
            Delivery typically takes 7-10 business days. Digital vouchers will be emailed within 24 hours.
          </p>
        </div>
      )}
    </div>
  );
}

export default Store;
