const welcomeMessage = (req, res, next) => {
    res.json({
        message: "Welcome!",
    })
}

module.exports = {
    welcomeMessage
}