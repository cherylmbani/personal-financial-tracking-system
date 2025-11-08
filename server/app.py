from datetime import datetime
from flask import Flask, jsonify, request, make_response, session
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_cors import CORS

from models import db, User, Transaction


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transactions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["SECRET_KEY"]="super_secret"
app.json.compact = False

CORS(app, resources={r"/*": {
    "origins": "http://localhost:5173",
    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})



db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)


class Start(Resource):
    def get(self):
        response_body={
            "message":"Transactions enabled!"
        }
        response=make_response(response_body, 200)
        return response
    

class Signup(Resource):
    def post(self):
        data=request.get_json()

        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone_number=data['phone_number'],
            password=data['password'],
        )
        db.session.add(new_user)
        db.session.commit()

        session['user_id'] = new_user.id
        response = make_response(new_user.to_dict(), 201)
        return response
class Login(Resource):
    def post(self):
        
        data=request.get_json()
        email=data['email']
        password=data['password']

        user=User.query.filter_by(email=email).first()
        if user and user.authenticate(password):
            session['user_id']=user.id
            return user.to_dict(), 200
        return {'error': "Invalid email or password"}, 401

class Logout(Resource):
    def post(self):
            
            session.pop('user_id', None)
            return make_response({"message": "Logged out successfully"}, 200)
 

class UserResource(Resource):
    def get(self):
        
        
        users=[user.to_dict() for user in User.query.all()]
        response=make_response(users, 200)
        return response

    def post(self):
        data = request.get_json()
        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone_number=data['phone_number']
        )
        new_user.password = data['password'] 

        db.session.add(new_user)
        db.session.commit()
        
        new_user_dict=new_user.to_dict()
        response=make_response(new_user_dict, 201)
        return response
class UserResourceById(Resource):
    def get(self, id):
        user = User.query.filter(User.id==id).first()
        if not user:
            return {"error": "User not found"}, 404
        user_dict=user.to_dict()
        response=make_response(user_dict, 200)
        return response

    def patch(self, id):
        user = User.query.filter(User.id==id).first()
        if not user:
            return {"error": "User not found"}, 404

        data = request.get_json()
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name=data['last_name']
        if 'phone_number' in data:
            user.phone_number=data['phone_number']
        if 'email' in data:
            user.email = data['email']
        if 'password' in data:
            user.password = data['password']
        db.session.commit()
        user_dict= user.to_dict()
        response=make_response(user_dict, 200)
        return response

    def delete(self, id):
        try:
            user = User.query.filter(User.id == id).first()
            if not user:
                return {"error": "User not found"}, 404

            
            try:
                # Delete user's transactions
                transactions = Transaction.query.filter_by(user_id=id).all()
                for transaction in transactions:
                    db.session.delete(transaction)
                
            except Exception as e:
                db.session.rollback()
                return {"error": f"Failed to delete user's related records: {str(e)}"}, 500

            # Now delete the user
            db.session.delete(user)
            db.session.commit()
            
            return {"message": "User deleted successfully"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500
        
class TransactionResource(Resource):
    def get(self):
        transactions=[transaction.to_dict() for transaction in Transaction.query.all()]
        response=make_response(transactions, 200)
        return response
    
    def post(self):
        data=request.get_json() #turn the json data into python dictionaries

        new_transaction=Transaction(
            amount=data['amount'],
            transaction_type=data['transaction_type'],
            category=data['category'],
            description=data['description'],
            date=data.get('date', datetime.utcnow()),
            user_id=data['user_id']
        )
        db.session.add(new_transaction)
        db.session.commit()

        new_transaction_dict=new_transaction.to_dict()
        response=make_response(new_transaction_dict, 201)
        return response
    
class TransactionResourceById(Resource):
    def get(self, id):
        transaction=Transaction.query.filter_by(id=id).first()
        if not transaction:
            return {"error": "Transaction not found!"}, 404
        transaction_dict=transaction.to_dict()
        response=make_response(transaction_dict, 200)
        return response
    
    def patch(self, id):
        transaction=Transaction.query.filter(Transaction.id==id).first()
        if not transaction:
            return {"error": "Transaction not found"}, 404

        data = request.get_json()
        if 'amount' in data:
            transaction.amount = data['amount']
        if 'transaction_type' in data:
            transaction.transaction_type=data['transaction_type']
        if 'category' in data:
            transaction.category=data['category']
        if 'description' in data:
            transaction.description=data['description']
        if 'date' in data:
            transaction.date=data['date']
        if 'user_id' in data:
            transaction.user_id=data['user_id']
        db.session.commit()

        transaction_dict=transaction.to_dict()
        response=make_response(transaction_dict, 200)
        return response
    
    def delete(self, id):
        try: 
            transaction=Transaction.query.filter(Transaction.id==id).first()
            if not transaction:
                return {"error": "Transaction not found"}, 404
            
            db.session.delete(transaction)
            db.session.commit()

            response_body={
                "message":"Transaction deleted successfully"
            }
            response=make_response(response_body, 200)
            return response


        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500

    


api.add_resource(Start, '/welcome')
api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')
api.add_resource(UserResource, '/users')
api.add_resource(UserResourceById, '/users/<int:id>')
api.add_resource(TransactionResource, '/transactions')
api.add_resource(TransactionResourceById, '/transactions/<int:id>')


if __name__ == '__main__':
    app.run(port=5555, debug=True)

# kill -9 $(lsof -t -i:5555)