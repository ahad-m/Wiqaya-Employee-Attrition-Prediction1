import joblib
import pandas as pd
from sklearn.model_selection import train_test_split


BINARY_COLS = [
    'MedicalInsurance', 'Bonus', 'OverTime',
    'Rewards&Wages_Satisfaction', 'Get_ Deserved_Promotion',
    'Useful_Training_Programs', 'Recognition',
    'Job_Stability', 'Health_Issues', 'Job_Opportunities'
]

ORDINAL_MAPS = {
    'Physical_Stress':         {'no': 0, 'sometimes': 1, 'yes': 2},
    'Psychological_Exhaustion':{'no': 0, 'sometimes': 1, 'yes': 2},
    'Age':                     {'21 to 30': 1, '31 to 40': 2, '41 to 50': 3, '51 to 60': 4},
    'Academic_degree':         {'diploma or secondary': 1, "bachelor's": 2, "master's": 3, 'ph.d': 4},
    'MonthlySalary': {
        'less than 5000 sar': 1, 'from 5000 to 10000 s.r': 2,
        'from 11000 to 15000 s.r': 3, 'from 16000 to 20000 s.r': 4,
        'from 21000 to 25000 s.r': 5, 'from 26000 to 30000 s.r': 6,
        's.r 31000 - and more': 7,
    },
    'Years_Experience': {
        'less than 5 years': 1, 'from 5 to 10 years': 2, 'from 11 to 15 years': 3,
        'from 16 to 20 years': 4, 'from 21 to 25 years': 5,
        'from 26 to 30 years': 6, 'from 31 to 35 years': 7,
    },
    'Years_experience_lastorganization': {
        'less than 5 years': 1, 'from 5 to 10 years': 2, 'from 11 to 15 years': 3,
        'from 16 to 20 years': 4, 'from 21 to 25 years': 5,
        'from 26 to 30 years': 6, 'from 31 to 35 years': 7,
    },
    'Training_programs_ During_last_three_years': {
        'i did not receive any training': 0, 'from 1 to 3 training programs': 1,
        'from 4 to 6 training programs': 2, 'from 7  training programs to more': 3,
    },
    'Job_Support':              {'low': 1, 'medium': 2, 'high': 3},
    'Emotional_Commitment':     {'low': 1, 'medium': 2, 'high': 3},
    'Environment_Satisfaction': {'low': 1, 'medium': 2, 'high': 3},
    'Job_Satisfaction':         {'not satisfied': 1, 'satisfied': 2, 'very satisfied': 3},
    'Job_Engagement':           {'difficult': 1, 'medium': 2, 'easy': 3},
    'Work_Live_Balance':        {'difficult': 1, 'medium': 2, 'easy': 3},
    'Distance_to_work':         {'close': 1, 'medium': 2, 'far': 3},
    'Business_Travel':          {'i do not travel for work': 1, 'travel rarely': 2, 'travel frequently': 3},
    'Payment_Overtime':         {"i don't have overtime": 1, 'no': 2, 'yes': 3},
}


def clean_raw(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if 'ID' in df.columns:
        df.drop(columns=['ID'], inplace=True)
    df.columns = df.columns.str.strip()
    for col in df.select_dtypes(include='object').columns:
        df[col] = df[col].str.strip().str.lower()
    return df


def encode_basic(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    for col in BINARY_COLS:
        if col in df.columns:
            df[col] = df[col].map({'yes': 1, 'no': 0})

    if 'Gender' in df.columns:
        df['Gender'] = df['Gender'].map({'male': 0, 'female': 1})

    for col, mapping in ORDINAL_MAPS.items():
        if col in df.columns:
            df[col] = df[col].map(mapping)

    # Maritalstatus — يدوي عشان يضمن الأعمدة دايماً موجودة
    if 'Maritalstatus' in df.columns:
        df['Maritalstatus_married'] = (df['Maritalstatus'] == 'married').astype(int)
        df['Maritalstatus_single']  = (df['Maritalstatus'] == 'single').astype(int)
        df.drop(columns=['Maritalstatus'], inplace=True)

    return df


def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    """
    تنظيف + ترميز — بدون Target Encoding.
    استخدمها على أي داتا قبل ما تطبّق الـ encoder.
    """
    df = clean_raw(df)
    df = encode_basic(df)
    return df


def fit_target_encoder(X_train, y_train, save_path="../models/target_encoder.pkl"):
    from category_encoders import TargetEncoder
    encoder = TargetEncoder(cols=['Sector', 'Department', 'JobTitle'])
    encoder.fit(X_train, y_train)
    joblib.dump(encoder, save_path)
    print(f"✅ Target Encoder saved to: {save_path}")
    return encoder