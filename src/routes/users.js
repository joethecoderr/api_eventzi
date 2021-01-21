'use strict'

const express = require('express')
const router = express.Router()
const UserServices = require('../services/usersService')
const UserService = new UserServices()
const bodyParser = require("body-parser");
const cookie = require('cookie-parser')
const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY
const AWS_LOAD = require('../lib/awsLoad')
const AWSLOAD = new AWS_LOAD
const Token = require('../lib/checkToken')
const token = new Token()

router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())
router.use(cookie())


router.get('/', token.authenticateToken, async (req, res) => {
  const users = await UserService.getUsers()
  res
    .status(200)
    .json({
      data: users,
      message: users.length ? 'All users' : 'Cant retrieve users',
      error: !users.length ? 'Not success': '',
    })
})


router.post('/validate', async (req, res) => {
  const  params  = req.body
  const user = await UserService.validateUser( {params} )
  if(user.length){
    const token = jwt.sign({id_user: user[0]["id_user"]}, jwtKey, {expiresIn: '180000s'})
    res.status(200).json({
      data: user, token,
      message: user.length ? `user id and cookie fetched` : '',
      error: !user.length ? `Bad credentials` : '',
    })
  }
  else{
    res
    .status(200)
    .json({
      data: user,
      message: user.length ? 'All users' : 'Cant retrieve users',
      error: !user.length ? 'bad credentials': '',
    })
}

})


router.post('/', async (req, res) => {
  const  params  = req.body
  const userId = await UserService.createUser( {params} )
  res.status(200).json({
    data: userId,
    message: userId.length ? `request succesful` : '',
    error: !userId.length ? '.Error ocurred while saving record': '',
  })
})
router.put('/:userId/updateAvatar', AWSLOAD.upload.single('avatar'), async (req, res) => {
  const userId  = req.params.userId
  let photo = null
  if(req.file !== undefined){
     photo = req.file.filename
  }
  const update = await UserService.updateAvatar( userId, photo )
  res.status(200).json({
    data: update,
    message: update ? `request succesful` : '',
    error: !update ? '.Error ocurred while saving record': '',
  })
})
router.get('/:userId', async (req, res) => {
  const { userId } = req.params
  const user = await UserService.getUser({ userId })
  res.status(200).json({
    data: user,
    message: user.length ? `user fetched` : '',
    error: !user.length ? `user not fetched` : '',
  })
})


router.put('/:userId', async (req, res) => {
  const { userId } = req.params
  const params = req.body
  const userUpdate = await UserService.updateUser({ userId, params })
  res
    .status(200)
    .json({
      data: userUpdate,
      message: userUpdate.length ? `user was updated` : '',
      error: `user not updated`,
    })
})

router.put('/:userId/password/', async (req, res) => {
  const { userId } = req.params
  const params = req.body
  const userUpdate = await UserService.updatePassword({ userId, params })
  res
    .status(200)
    .json({
      data: [],
      message: userUpdate ? `psswdwas updated` : '',
      error: !userUpdate ? `password not updated`: '',
    })
})


router.delete('/:userId', async (req, res) => {
  const { userId } = req.params
  const userDelete = await UserService.deleteUser({ userId })
  res.status(200).json({
    data: {},
    message: userDelete ? `user  was deleted` : '',
    error: !userDelete ? `user was not deleted` : '',
  })
})

module.exports = router
