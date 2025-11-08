from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from sqlalchemy import MetaData
from sqlalchemy.orm import validates, relationship
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
import re


db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
metadata = MetaData(naming_convention=convention)

class User(db.Model, SerializerMixin):
    __tablename__="users"
    serialize_rules=('-transactions.user','_password_hash')
    id=db.Column(db.Integer, primary_key=True)
    first_name=db.Column(db.String, nullable=False)
    last_name=db.Column(db.String, nullable=False)
    phone_number=db.Column(db.Integer, nullable=False)
    email=db.Column(db.Text, nullable=False)
    _password_hash=db.Column('password', db.Text, nullable=False)
    created_at=db.Column(db.DateTime, default=db.func.now())
    transactions=db.relationship("Transaction", back_populates='user')

    @validates('email')
    def validate_email(self, key, address):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", address):
            raise ValueError(f"Invalid email address: {address}")
        return address

    # Authenticating password
    @property
    def password(self):
        raise AttributeError("Password is write-only!")

    @password.setter
    def password(self, password):
        pw_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = pw_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    # validating phone number
    @validates('phone_number')  # Add this field to your model first
    def validate_phone_number(self, key, phone):
        if not phone:
            raise ValueError("Phone number is required")
        
        # Remove any spaces/dashes and check if it's 10 digits
        clean_phone = re.sub(r'[\s\-]', '', phone)
        
        if not clean_phone.isdigit():
            raise ValueError("Phone number must contain only digits")
            
        if len(clean_phone) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
            
        # Optional: Check if it starts with 07, 01, or 254
        if not clean_phone.startswith(('07', '01', '254')):
            raise ValueError("Phone number must be a valid Kenyan format")
            
        return clean_phone

    def __repr__(self):
        return f'<{self.id} {self.first_name} {self.last_name} {self.email}>'

class Transaction(db.Model, SerializerMixin):
    __tablename__="transactions"
    serialize_rules=('-user.transactions',)
    id=db.Column(db.Integer, primary_key=True)
    amount=db.Column(db.Integer, nullable=False)
    transaction_type=db.Column(db.String)
    category=db.Column(db.String)
    description=db.Column(db.Text)
    date=db.Column(db.DateTime, default=db.func.now())
    user_id=db.Column(db.Integer, db.ForeignKey('users.id'))
    user=db.relationship('User', back_populates="transactions")

    def __repr__(self):
        return f"<{self.id} {self.amount} {self.transaction_type} {self.category}"
    