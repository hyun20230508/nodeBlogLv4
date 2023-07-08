const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  if (!req.cookies) {
    res.status(403).json({
      errorMessage: '로그인이 필요한 기능입니다.',
    });
    return;
  }
  const { authorization } = req.cookies;
  const [authType, authToken] = (authorization ?? '').split(' ');
  if (authType !== 'Bearer' || !authToken) {
    res.status(400).json({
      errorMessage: '토큰이 유효하지 않습니다.',
    });
    return;
  }

  try {
    const decodedToken = jwt.verify(authToken, 'skey');
    const userId = decodedToken.userId;
    res.locals.user = userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(400).json({
      errorMessage: '비정상적인 접근입니다.',
    });
    return;
  }
};
