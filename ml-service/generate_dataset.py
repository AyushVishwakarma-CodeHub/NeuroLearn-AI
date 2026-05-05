import pandas as pd
import numpy as np
import random
import os

def generate_data(num_samples=1500):
    data = []
    for _ in range(num_samples):
        # Features
        last_score = round(random.uniform(20, 100), 1)
        study_duration = round(random.uniform(5, 120), 1)  # minutes
        total_reviews = random.randint(1, 15)
        last_gap_days = random.randint(1, 30)
        
        # Logic for "days_until_next_revision" (Target)
        # Higher score + more reviews = longer gap before next revision is needed
        # We model the Ebbinghaus forgetting curve loosely
        
        base_retention_days = (last_score / 10) + (total_reviews * 1.5)
        
        # Diminishing returns on excessive study duration
        duration_factor = min(study_duration / 20, 3) 
        
        # Calculate target with some randomness/noise to mimic real human behavior
        noise = random.uniform(-2, 2)
        days_until_next_revision = int(base_retention_days + duration_factor + noise)
        
        # Ensure minimum is at least 1 day
        days_until_next_revision = max(1, days_until_next_revision)
        
        data.append([last_score, study_duration, total_reviews, last_gap_days, days_until_next_revision])
        
    df = pd.DataFrame(data, columns=['last_score', 'study_duration', 'total_reviews', 'last_gap_days', 'days_until_next_revision'])
    
    file_path = os.path.join(os.path.dirname(__file__), 'study_data.csv')
    df.to_csv(file_path, index=False)
    print(f"Dataset generated successfully! ({num_samples} rows)")
    print(f"Saved to: {file_path}")

if __name__ == '__main__':
    # Set a seed so the dataset is somewhat reproducible
    random.seed(42)
    np.random.seed(42)
    generate_data()
