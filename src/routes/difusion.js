'use strict'

const express = require('express')
const router = express.Router()

const difusionService = require('../services/difusionService')
const DifusionService = new difusionService()

const bodyParser = require("body-parser");
const cookie = require('cookie-parser')



router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json()) 
router.use(cookie())

router.get('/events/:eventId',async (req, res) => {
  const eventId = req.params.eventId
  const eventMessage = await DifusionService.getMessage(eventId)
  res
    .status(200)
    .json({
      data: eventMessage,
      message: eventMessage.length ? 'message fetched ' : '',
      error: !eventMessage.length ? 'Cant retrieve message': '',
    })
})

router.post('/events/:eventId', async (req, res) => {
    const { eventId } = req.params
    const params = req.body
    const difusion = await DifusionService.createMessage({ eventId, params })
    res
      .status(200)
      .json({
        data: difusion,
        message: difusion ? `New message created` : '',
        error: !difusion ? `Can not create message` : '',
      })
  })

  router.put('/events/:eventId', async (req, res) => {
    const { eventId } = req.params
    const params = req.body
    const difusion = await DifusionService.updateMessage({ eventId, params })
    res
      .status(200)
      .json({
        data: difusion,
        message: difusion ? `New message created` : '',
        error: !difusion ? `Can not create message` : '',
      })
  })




module.exports = router
