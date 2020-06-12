const mongoose = require("mongoose");
const config = require('../config');
const md5 = require('md5');
const Check = require('./checkU');

const UserSchema = new mongoose.Schema({
    name : { type: String, required: true },
    lastName : { type: String },
    password : { type: String, required: true },
    role : { type: String },
    courses : [ { type : Object } ] ,
    telegram : {type: String},
    telegram_chat_id : {type: Number},
    avaUrl : {type: String},
    date : {type : Date},
    dateOfBirth : {type : Date},
    facebookName : {type : String},
    facebookId : {type: String}
});

const UserModel = mongoose.model('User', UserSchema);


class User {
    constructor (name, lastName, password, courses, role, date, telegram, telegram_chat_id, avaUrl, dateOfBirth, facebookName, facebookId) {
        this.name = name;
        this.lastName= lastName;
        this.password = password;
        this.courses = courses;
        this.role = role;
        this.date = date;
        this.avaUrl = avaUrl;
        this.telegram = telegram;
        this.telegram_chat_id = telegram_chat_id;
        this.dateOfBirth = dateOfBirth;
        this.facebookName = facebookName;
        this.facebookId = facebookId;
    }

    static getById(id) {
        return UserModel.findById(id);
    }

    static getByTelegramName(name) {
        return UserModel.findOne({ telegram : name}).exec();
    }

    static getAllAdmins() {
        UserModel.find()
        .then(users => {
            // console.log(users);
            // console.log(users.find(auth => auth.role === Check.Role.Admin));
            return Promise.resolve(users.find(auth => auth.role === Check.Role.Admin));
        });
    }

    static findOrCreate(facebookId, facebookName){
        return UserModel.findOne({facebookId : facebookId})
        .then(user => {
            if (user) return user;
            else {
                return UserModel.findOne({facebookName : facebookName})
                .then(user => {
                    if(user) {
                        return User.updateWithoutHashing(user._id, 
                            new User(
                                user.name,
                                user.lastName,
                                user.password,
                                user.courses,
                                user.role,
                                user.date,
                                user.telegram,
                                user.telegram_chat_id,
                                user.avaUrl,
                                user.dateOfBirth,
                                user.facebookName,
                                facebookId
                            )
                        )
                    } else {
                        return User.insert( 
                            new User(
                                facebookName,
                                "",
                                facebookId,
                                [],
                                "Utilizer",
                                new Date(),
                                "",
                                "",
                                "https://res.cloudinary.com/studynodecloud/image/upload/v1542324391/user.png",
                                new Date(),
                                facebookName,
                                facebookId
                            )
                        )
                    }
                })
                .catch((err) => console.log(err));
            }
        });
        
    }

    static getAll() {
        return UserModel.find();//.sort({ created: -1});
    }

    static insert(user) {
        user.password = md5(`${user.password}${config.Salt}`);
        return new UserModel(user).save();
    }
        
    static update(id, user) {
        user.password = md5(`${user.password}${config.Salt}`);
        return UserModel.findByIdAndUpdate(id, user, {new: true}).exec();
    }

    static updateWithoutHashing(id, user) {
        return UserModel.findByIdAndUpdate(id, user, {new: true}).exec();
    }

    static delete(id) {
        return UserModel.deleteOne({ _id: id }).exec();
    }

    static findUser(name) {
        return UserModel.find({name : name}).exec();
    }

    static authorization(name , password) {
        return UserModel.find({ name: name }).exec()
            .then(result => {
                // if (md5(`${password}${config.Salt}`) === result.password) return Promise.resolve(result);
                // return result;
                if (result.length > 1 || result.length <= 0) Promise.reject(new Error(`Error: incorrect login`));
                else {
                    
                    const auth = result[0];
                    // console.log("!");
                    // console.log(md5(`${password}${config.Salt}`));
                    // console.log(auth.password);
                    // console.log("!");
                    if (md5(`${password}${config.Salt}`) === auth.password) return Promise.resolve(auth);
                    Promise.reject(new Error(`Error: incorrect login`));
                }
            });
    }
}

module.exports = User;