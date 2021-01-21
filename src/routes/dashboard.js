'use strict'

const express = require('express')
const router = express.Router()

const dashboardService = require('../services/dashboardService')
const DashboardService = new dashboardService()

router.get('/MaleFemale/total',async (req, res) => {
  const users = await DashboardService.getMaleFemaleUsers()
  res
    .status(200)
    .send(users)
})
router.get('/users/country',async (req, res) => {
    const users = await DashboardService.getUsersByCountry()
    res
      .status(200)
      .send(users)
  })
router.get('/users/ActiveInactive',async (req, res) => {
const users = await DashboardService.getUsersActiveInactive()
res
    .status(200)
    .send(users)
})
router.get('/events/status',async (req, res) => {
    const events = await DashboardService.getEventsStatus()
    res
      .status(200)
      .send(events)
  })
  router.get('/organizations/:organizationId',async (req, res) => {
    const organizationId = req.params.organizationId
    const events = await DashboardService.getEventsStatusByOrg(organizationId)
    res
      .status(200)
      .send(events)
  })
  router.get('/events/type',async (req, res) => {
    const events = await DashboardService.getEventsByType()
    res
      .status(200)
      .send(events)
  })

module.exports = router
