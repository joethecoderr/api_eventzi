'use strict'

const express = require('express')
const OrganizationsServices = require('../services/orgService')
const router = express.Router()
const OrganizationsService = new OrganizationsServices()
const AWS_LOAD = require('../lib/awsLoad')
const AWSLOAD = new AWS_LOAD
const Token = require('../lib/checkToken')
const token = new Token()

router.get('/', async (req, res) => {
  const organizations = await OrganizationsService.getOrganizations()
  res
    .status(200)
    .json({
      data: organizations,
      message: organizations.length ? 'All Organizations' : '',
      error: !organizations.length ? 'Cant get organizations': ''
    })
})
router.get('/events/organizers', token.authenticateToken, async (req, res) => {
  const userId = req.userId
  const organizers = await OrganizationsService.getEventsWithOrganizers( userId )
  res.status(200).json({
    data: organizers,
    message: organizers.length ? `organizers events list fetched` : '',
    error: !organizers.length ? `Error getting list` : '',
  })
})

router.get('/orgsByUser/', token.authenticateToken, async (req, res) => {
  const userId = req.userId
  const organization = await OrganizationsService.getOrganizationByUser(userId)
  res
    .status(200)
    .json({
      data: organization,
      message: organization ? 'Organizations fetched' : '',
      error: !organization ? 'error while getting data': '',
    })
})
router.get('/:organizationId', async (req, res) => {
    const { organizationId }   = req.params
    const organization = await OrganizationsService.getOrganization( {organizationId} )
    res.status(200).json({
      data: organization,
      message: organization.length ? `organization retrieved` : '',
      error: !organization.length ? `organization not retrieved. Verify ID` : '',
    })
  })

router.post('/', AWSLOAD.upload.single('logo'), token.authenticateToken, async (req, res) => {
  const  params  = req.body 
  const userId = req.userId
  let logo
  if(req.file !== undefined){
    logo = req.file.filename
  }
  
  const organization = await OrganizationsService.createOrganization( {params, userId, logo} )
  res.status(200).json({
    data: organization,
    message: organization.length ? `organization created` : '',
    error: !organization.length ? `an error ocurred` : '',
  })
}) 
/*
router.post('/', async (req, res) => {
  const  params  = req.body 
  const userId = req.userId
  let logo
  console.log(req.body)
  res.status(200).json({"message":"ok"
  })
}) */

router.put('/:organizationId', AWSLOAD.upload.single('logo'), async (req, res) => {
  const { organizationId } = req.params
  const params = req.body
  let logo
  if(req.file !== undefined){
    logo = req.file.filename
  }
  const orgUpdate = await OrganizationsService.updateOrganization({ organizationId, params, logo })
  res
    .status(200)
    .json({
      data: orgUpdate,
      message: orgUpdate ? `Organization was updated` : '',
      error: !orgUpdate ? `Organization was not updated` : '',
    })
})

router.delete('/:organizationId', async (req, res) => {
  const  organizationId  = req.params.organizationId
  const orgazationDelete = await OrganizationsService.deleteOrganization( organizationId )
  res.status(200).json({
    data: {},
    message: orgazationDelete ? `organization was deleted` : '',
    error: !orgazationDelete ? `organization not deleted` : '',
  })
})

router.get('/:organizationId/events', token.authenticateToken, async (req, res) => {
  const organizationId  = req.params.organizationId;
  const userId = req.userId
  const event = await OrganizationsService.getEventsByOrganization(organizationId, userId )
  res.status(200).json({
    data: event,
    message: event.length ? `Events list fetched` : '',
    error: !event.length ? `Error getting events` : '',
  })
})

router.get('/:organizationId/organizers', async (req, res) => {
  const  organizationId  = req.params.organizationId;
  const organizers = await OrganizationsService.getOrganizers( organizationId )
  res.status(200).json({
    data: organizers,
    message: organizers.length ? `organizers list  fetched` : '',
    error: !organizers.length ? `Error getting orgamozers` : '',
  })
})



module.exports = router
