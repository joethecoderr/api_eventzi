
const express = require('express')
const PartnersServices = require('../services/partnersService')
const router = express.Router()
const PartnersService = new PartnersServices()

const AWS_LOAD = require('../lib/awsLoad')
const AWSLOAD = new AWS_LOAD

router.get('/events/:eventId', async (req, res) => {
  const eventId = req.params.eventId   
  const partners = await PartnersService.getPartners(eventId)
  res
    .status(200)
    .json({
      data: partners,
      message: partners.length ? 'All partners' : 'Cant get partners',
      error: !partners.length ? 'Couldnt fetch': '',
    })
})

router.get('/organizations/:organizationId', async (req, res) => {
    const  organizationId    = req.params.organizationId
    const partners = await PartnersService.getPartnersByOrg( organizationId)
    res.status(200).json({
      data: partners,
      message: partners.length ? `Partners retrieved` : '',
      error: !partners.length ? `Couldnt retrieve partners` : '',
    })
  })

router.post('/events/:eventId', AWSLOAD.upload.single('logo'), async (req, res) => {
  const params  = req.body  
  const eventId = req.params.eventId
  let logo
  if(req.file !== undefined){
    logo = req.file.filename
 }
  const partner = await PartnersService.createPartner( {params, eventId, logo} )
  res.status(200).json({
    data: partner,
    message: partner.length ? `partner added` : '',
    error: !partner.length ? `` : '',
  })
})

router.post('/:partnerId/events/:eventId', async (req, res) => {
  const partnerId = req.params.partnerId
  const eventId = req.params.eventId
  const partner = await PartnersService.addExistantPartner(partnerId, eventId )
  res.status(200).json({
    data: partner,
    message: partner ? `partner added` : '',
    error: !partner ? `an error ocurred` : '',
  })
})

router.put('/:partnerId', async (req, res) => {
  const {partnerId}  = req.params
  const params = req.body
  const partner = await PartnersService.updatePartner({ partnerId, params })
  res
    .status(200)
    .json({
      data: partner,
      message: partner ? `Partner updated` : '',
      error: !partner ? `Partner not updated` : '',
    })
})

router.put('/:partnerId/logo', AWSLOAD.upload.single('logo'), async (req, res) => {
  const  partnerId  = req.params.partnerId
  const logo = req.file.filename
  const logoUpdate = await PartnersService.updatePartnerLogo(partnerId, logo)
  res
    .status(200)
    .json({
      data: logoUpdate,
      message: logoUpdate.length ? `Updated partner logo` : '',
      error: !logoUpdate ? `Partner logo not updated` : '',
    })
})


module.exports = router