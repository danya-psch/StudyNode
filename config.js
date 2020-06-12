module.exports = {
    ServerPort : process.env["PORT"] || 3000,
    DatabaseUrl : process.env["DATABASE_URL"] || 'mongodb://localhost:27017/mydb',
    cloudinary : { cloud_name : process.env["CLOUD_NAME"], api_key : process.env["API_KEY"], api_secret : process.env["API_SECRET"] },
    bot_token : process.env["TELEGRAM_BOT_TOKEN"],
    facebookAppId : process.env["F_APP_ID"],
    facebookAppSecret : process.env["F_APP_SECRET"],
    Facebook_callbackURL : process.env["F_CALLBACK_URL"],
    Salt : 's0/\/\P4$$w0rD'
};