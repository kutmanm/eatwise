from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Index, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .user import Base
from utils.crypto import encrypt_text, decrypt_text


class SymptomType(enum.Enum):
    # Digestive symptoms
    BLOATING = "bloating"
    STOMACH_PAIN = "stomach_pain"
    NAUSEA = "nausea"
    HEARTBURN = "heartburn"
    DIARRHEA = "diarrhea"
    CONSTIPATION = "constipation"
    GAS = "gas"
    INDIGESTION = "indigestion"
    
    # Skin symptoms
    ACNE = "acne"
    ECZEMA = "eczema"
    RASH = "rash"
    ITCHING = "itching"
    DRYNESS = "dryness"
    INFLAMMATION = "inflammation"
    
    # Energy/Fatigue symptoms
    FATIGUE = "fatigue"
    LOW_ENERGY = "low_energy"
    BRAIN_FOG = "brain_fog"
    DROWSINESS = "drowsiness"
    RESTLESSNESS = "restlessness"
    
    # Mood symptoms
    ANXIETY = "anxiety"
    IRRITABILITY = "irritability"
    MOOD_SWINGS = "mood_swings"
    DEPRESSION = "depression"
    
    # Physical symptoms
    HEADACHE = "headache"
    JOINT_PAIN = "joint_pain"
    MUSCLE_PAIN = "muscle_pain"
    INFLAMMATION_GENERAL = "inflammation_general"
    
    # Sleep symptoms
    INSOMNIA = "insomnia"
    POOR_SLEEP_QUALITY = "poor_sleep_quality"
    SLEEP_DISTURBANCES = "sleep_disturbances"
    
    # Other
    OTHER = "other"


class SymptomSeverity(enum.Enum):
    MILD = 1
    MODERATE = 3
    SEVERE = 5
    VERY_SEVERE = 7
    EXTREME = 10


class SymptomDomain(enum.Enum):
    DIGESTION = "digestion"
    SKIN = "skin"
    FATIGUE = "fatigue"
    MOOD = "mood"
    SLEEP = "sleep"
    PHYSICAL = "physical"
    OTHER = "other"


class SymptomLog(Base):
    __tablename__ = "symptom_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Symptom details
    symptom_type = Column(String, nullable=False)  # SymptomType enum value
    symptom_domain = Column(String, nullable=False)  # SymptomDomain enum value
    severity = Column(Integer, nullable=False)  # 1-10 scale
    
    # Timing
    occurred_at = Column(DateTime, nullable=False)  # When the symptom occurred
    logged_at = Column(DateTime, nullable=False, default=datetime.utcnow)  # When it was logged
    duration_minutes = Column(Integer, nullable=True)  # How long it lasted
    
    # Context
    # Free-text description (encrypted at rest)
    _notes = Column("notes", Text, nullable=True)
    triggers = Column(JSON, nullable=True)  # Suspected triggers (foods, activities, etc.)
    
    # Relationships
    user = relationship("User", back_populates="symptom_logs")
    
    # Indexes for efficient querying
    __table_args__ = (
        Index('ix_symptom_logs_user_occurred', 'user_id', 'occurred_at'),
        Index('ix_symptom_logs_domain_severity', 'symptom_domain', 'severity'),
        Index('ix_symptom_logs_type', 'symptom_type'),
    )

    @property
    def notes(self):
        return decrypt_text(self._notes)

    @notes.setter
    def notes(self, value: str):
        self._notes = encrypt_text(value)


class LifestyleLog(Base):
    __tablename__ = "lifestyle_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Lifestyle factors
    date = Column(DateTime, nullable=False)  # Date of the log
    sleep_hours = Column(Float, nullable=True)  # Hours of sleep
    sleep_quality = Column(Integer, nullable=True)  # 1-10 scale
    stress_level = Column(Integer, nullable=True)  # 1-10 scale
    exercise_minutes = Column(Integer, nullable=True)  # Minutes of exercise
    exercise_type = Column(String, nullable=True)  # Type of exercise
    water_intake = Column(Float, nullable=True)  # Liters of water
    alcohol_servings = Column(Integer, nullable=True)  # Number of alcoholic drinks
    
    # Additional factors
    medications = Column(JSON, nullable=True)  # List of medications taken
    supplements = Column(JSON, nullable=True)  # List of supplements taken
    # Free-text notes (encrypted at rest)
    _notes = Column("notes", Text, nullable=True)
    
    logged_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="lifestyle_logs")
    
    # Indexes
    __table_args__ = (
        Index('ix_lifestyle_logs_user_date', 'user_id', 'date'),
    )

    @property
    def notes(self):
        return decrypt_text(self._notes)

    @notes.setter
    def notes(self, value: str):
        self._notes = encrypt_text(value)
