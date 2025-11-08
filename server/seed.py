#!/usr/bin/env python3
# server/seed.py
# seed.py
#!/usr/bin/env python3

from app import app, db
from models import User, Transaction
from datetime import datetime

def seed_database():
    with app.app_context():
        print("Clearing existing data...")
        User.query.delete()
        Transaction.query.delete()


        users=[
            User(
                first_name="Lenny",
                last_name="Ronaldo",
                email="lennyronaldo@gmail.com",
                phone_number="0723020507",
                password="password123"

            ),
            User(
                first_name="Sarah",
                last_name="Kamau", 
                email="sarah.kamau@gmail.com",
                phone_number="0712345678",
                password="password123"
            ),
            User(
                first_name="Mike",
                last_name="Ochieng",
                email="mike.ochieng@gmail.com", 
                phone_number="0734567890",
                password="password123"
            ),
            User(
                first_name="Basil",
                last_name="Omondi",
                email="basil.omondi@gmail.com", 
                phone_number="0734567899",
                password="password123"
            )
        ]
        db.session.add_all(users)
        db.session.commit()
        print("Users created")

        transactions=[
            Transaction(
                amount=1500,
                transaction_type="expense",
                category="shopping",
                description="New clothes at Sarit",
                date=datetime(2024, 12, 15, 14, 30),
                user_id=users[0].id
            ),
            Transaction(
                amount=500,
                transaction_type="expense", 
                category="transport",
                description="Uber to town",
                date=datetime(2024, 12, 16, 9, 15),
                user_id=users[0].id
            ),
            Transaction(
                amount=25000,
                transaction_type="income",
                category="salary", 
                description="December salary",
                date=datetime(2024, 12, 1, 8, 0),
                user_id=users[0].id
            ),
            Transaction(
                amount=750,
                transaction_type="expense",
                category="food",
                description="Groceries at Naivas", 
                date=datetime(2024, 12, 17, 16, 45),
                user_id=users[1].id
            ),
            Transaction(
                amount=1200,
                transaction_type="expense",
                category="bills",
                description="Electricity token",
                date=datetime(2024, 12, 10, 12, 0),
                user_id=users[1].id  
            ),
            Transaction(
                amount=30000,
                transaction_type="income",
                category="freelance",
                description="Website project payment",
                date=datetime(2024, 12, 5, 10, 0), 
                user_id=users[2].id
            ),
            Transaction(
                amount=2000,
                transaction_type="expense",
                category="entertainment",
                description="Movie tickets and dinner",
                date=datetime(2024, 12, 14, 19, 30),
                user_id=users[2].id
            )


        ]
        db.session.add_all(transactions)
        db.session.commit()
        print("Transactions created!")

if __name__ == "__main__":
    seed_database()
        
