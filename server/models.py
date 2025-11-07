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

    id=db.Model(db.Integer, primary_key=True)
    first_name=db.Model(db.String, nullable=False)
    last_name=db.Model(db.String, nullable=False)
    email=db.Model(db.Text, nullable=False)
    _password_hash=db.Model('password', db.Text, nullable=False)
    created_at=db.Model(db.DateTime, default=db.func.now())

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

    def __repr__(self):
        return f'<{self.id} {self.name} {self.email}>'

