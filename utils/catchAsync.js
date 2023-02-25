// 该函数会返回一个新函数，新函数会执行传递给wrapAsync函数的所有代码，并增加.catch()。如果其中有错误，（无论是throw new 自己抛出的还是系统抛出的），都会被catch捕获并传给next
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}