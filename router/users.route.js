const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const jwt = require('jsonwebtoken');

//회원 가입 api
router.post('/signup', async (req, res) => {
  const { nickname, password, confirm } = req.body;
  const searchStr = /[^a-zA-Z0-9]/;
  try {
    if (
      nickname.length < 4 ||
      nickname.length > 16 ||
      nickname.search(searchStr) != -1
    ) {
      res.status(400).json({
        errorMessage:
          '닉네임에는 특수문자 사용이 불가능하며, 4글자 이상 16글자 이하로 작성되어야합니다.',
      });
      return;
    }
    if (password !== confirm) {
      res.status(400).json({
        errorMessage: '패스워드가 패스워드 확인란과 다릅니다.',
      });
      return;
    }

    const existsUsers = await Users.findOne({ where: { nickname } });
    if (existsUsers) {
      res.status(400).json({
        errorMessage: '중복된 닉네임입니다.',
      });
      return;
    }

    await Users.create({ nickname, password });
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(400).json({ errorMessage: '회원가입에 실패했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { nickname, password } = req.body;
  const user = await Users.findOne({ where: { nickname } });
  if (!user) {
    return res.status(401).json({ message: '존재하지 않는 닉네임입니다.' });
  } else if (user.password !== password) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  const token = jwt.sign(
    {
      userId: user.userId,
    },
    'skey',
    {
      expiresIn: '1h',
    }
  );
  res.cookie('authorization', `Bearer ${token}`);
  return res.status(200).json({ message: '로그인 성공' });
});

module.exports = router;
