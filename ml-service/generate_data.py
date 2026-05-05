import pandas as pd
import numpy as np
import os

# Generate a realistic synthetic dataset for spaced repetition memory decay
# We will generate 5000 records.
num_records = 5000

# Random seeds for reproducibility
np.random.seed(42)

# Features:
# last_score: 0 to 100
last_scores = np.random.normal(75, 15, num_records)
last_scores = np.clip(last_scores, 0, 100)

# study_duration: 5 to 120 minutes
study_durations = np.random.exponential(30, num_records)
study_durations = np.clip(study_durations, 5, 120)

# total_reviews: 1 to 20
total_reviews = np.random.poisson(lam=4, size=num_records)
total_reviews = np.clip(total_reviews, 1, 20)

# last_gap_days: 0 to 30 days
last_gap_days = np.random.exponential(5, num_records)
last_gap_days = np.clip(last_gap_days, 0, 30)

# Target variable: days_until_next_revision
# Base formula (heuristic):
# Higher score -> more days
# More reviews -> more days
# Longer gap previously -> more days (spaced repetition effect)
# Longer study -> slight positive effect
days_until_next_revision = (
    (last_scores / 100) * 5 + 
    (total_reviews * 1.5) + 
    (last_gap_days * 0.5) + 
    (study_durations / 60)
)

# Add some random noise to simulate human variance
noise = np.random.normal(0, 1.5, num_records)
days_until_next_revision = days_until_next_revision + noise

# Ensure it's not negative and has a sensible upper bound (e.g. 6 months)
days_until_next_revision = np.clip(days_until_next_revision, 0, 180).round(2)

# Create DataFrame
df = pd.DataFrame({
    'last_score': last_scores.round(2),
    'study_duration': study_durations.round(2),
    'total_reviews': total_reviews,
    'last_gap_days': last_gap_days.round(2),
    'days_until_next_revision': days_until_next_revision
})

# Save to CSV
output_path = os.path.join(os.path.dirname(__file__), 'study_data.csv')
df.to_csv(output_path, index=False)

print(f"Successfully generated {num_records} synthetic study records!")
print(f"Saved to: {output_path}")
