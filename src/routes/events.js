'use strict'

const express = require('express')
const router = express.Router()
const eventsService = require('../services/eventsService')
const EventsService = new eventsService()
const Token = require('../lib/checkToken')
const token = new Token()
const AWS = require('aws-sdk');
const bodyParser = require("body-parser");

const AWS_LOAD = require('../lib/awsLoad');
const { every } = require('mysql2/lib/constants/charset_encodings')
const AWSLOAD = new AWS_LOAD


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json()) 

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
});
let params = {
  Bucket: process.env.BUCKET_NAME, 
  
 };

router.get('/',async (req, res) => {
  const events = await EventsService.getEvents()
  res
    .status(200)
    .json({
      data: events,
      message: events.length ? 'All events' : '',
      error: 'Cant retrieve events',
    })
})
router.get('/upcoming/', async (req, res) => {
  const events = await EventsService.getUpcomingEvents()
  res
    .status(200)
    .json({
      data: events,
      message: events.length ? 'Upcoming events' : '',
      error: !events.length ? 'no upcoming events': '',
    })
})
router.get('/everything/', token.authenticateToken,  async (req, res) => {
  const userId = req.userId
  const everything = await EventsService.getEverything(userId)
  res.status(200).json({
    data: everything,
    message: everything.length ? `Event fetched` : '',
    error: !everything.length ? `Event not fetched. Verify ID` : '',
  })
})

router.get('/byAdmin', token.authenticateToken,async (req, res) => {
  const userId = req.userId
  const events = await EventsService.getEventsByAdmin(userId)
  res
    .status(200)
    .json({
      data: events,
      message: events.length ? 'All events' : '',
      error: !events.length ? 'Cant retrieve events': '',
    })
})
router.get('/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const event = await EventsService.getEvent({ eventId })
  res.status(200).json({
    data: event,
    message: event.length ? `Event fetched` : '',
    error: !event.length ? `Event not fetched. Verify ID` : '',
  })
})


router.get('/:eventId/media', async (req, res) => {
  const { eventId } = req.params;

  const event = await EventsService.getEventMedia({ eventId })
  console.log('Endpoint ', event[0]["banner"])
  let fileName = event[0]["banner"]
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
  });
  if(event.length){ 
    const params = {
      Bucket: process.env.BUCKET_NAME, 
      Key: fileName, 
     };
     s3.getObject(params, function(err, data) {
      var image = data["Body"].toString("base64")
      if (err) console.log('Error m8', err, err.stack); 
      else     console.log('Llegue aqui');
      res.status(200).json( {header: 'Event Image', 
                            image: image});
    })
  }
  else{
    res.status(200).json({message: 'Could not fin image'})
  }
}) 

router.get('/:eventId/media/logo', async (req, res) => {
  const { eventId } = req.params;

  const event = await EventsService.getEventMediaLogo({ eventId })
  console.log('Endpoint ', event[0]["logo"])
  let fileName = event[0]["logo"]

  if(event.length){ 
    params["Key"] = fileName

     s3.getObject(params, function(err, data) {
      var image = data["Body"].toString("base64")
      if (err) console.log('Error m8', err, err.stack); 
      else     console.log('Llegue aqui');
      res.status(200).json( {header: 'Event Image', 
                            image: image});
    })
  }
  else{
    res.status(200).json({message: 'Could not fin image'})
  }
}) 
  

router.get('/users/organizer', token.authenticateToken,async (req, res) => {
  const userId = req.userId
  const events = await EventsService.getEventsByOrganizer(userId)
  res
    .status(200)
    .json({
      data: events,
      message: events.length ? 'All events' : '',
      error: !events.length ? 'Cant retrieve events': '',
    })
})

router.delete('/organizers/:organizerId/delete', token.authenticateToken,async (req, res) => {
  const organizerId = req.params.organizerId
  const organizer = await EventsService.deleteOrganizer(organizerId)
  res
    .status(200)
    .json({
      data: organizer,
      message: organizer ? 'Organizer deleted' : '',
      error: !organizer ? 'couldnt delete organizer': '',
    })
})




var cpUpload = AWSLOAD.upload.fields([{name: 'logo', maxCount:1}, {name: 'banner', maxCount:1}])

router.post('/organizations/:organizationId', cpUpload, token.authenticateToken, async (req, res) => {
  const params = req.body
  const {organizationId} = req.params
  let logo = null
  if(req.files['logo'] !== undefined){
    logo = req.files['logo'][0].filename
  }
  let banner = null
  if(req.files['banner'] !== undefined){
    banner = req.files['banner'][0].filename
  }
  const eventId = await EventsService.createEvent({ params , organizationId, logo, banner})
  res.status(200).json({
    data: eventId,
    message: eventId ? `New event is created` : '',
    error:  !eventId ? `Fails to create event`: '',
  })

})

router.put('/:eventId', async (req, res) => {
  const { eventId } = req.params
  const params = req.body
  
  const eventUpdate = await EventsService.updateEvent({ eventId, params })
  res
    .status(200)
    .json({
      data: eventUpdate,
      message: eventUpdate.length ? `Event was updated` : '',
      error: !eventUpdate.length ? `Event not updated. Verify ID` : '',
    })
})
router.put('/:eventId/media',AWSLOAD.upload.single('banner'), token.authenticateToken,async (req, res) => {
  const eventId = req.params.eventId
  let banner = null
  if(req.files['banner'] !== undefined){
    banner = req.files['banner'][0].filename
  }
  const eventUpdate = await EventsService.updateEventMediaBanner({ eventId, banner})
  res.status(200).json({
    data: eventUpdate,
    message: eventUpdate ? `Event Media updated` : '',
    error:  !eventUpdate ? `An error ocurred`: '',
  })
})

router.put('/:eventId/logo',AWSLOAD.upload.single('logo'), async (req, res) => {
  const eventId = req.params.eventId
  let logo = null
  if(req.file !== undefined){
    logo = req.file.filename
  }
  const eventUpdate = await EventsService.updateEventMediaLogo({ eventId, logo})
  res.status(200).json({
    data: eventUpdate,
    message: eventUpdate ? `Event Media updated` : '',
    error:  !eventUpdate ? `An error ocurred`: '',
  })
})


router.post('/:eventId/register', async (req, res) => {
  const  eventId= req.params.eventId
  const email = req.body.email
  const register = await EventsService.registerToEvent(email, eventId)
  res
    .status(200)
    .json({
      data: register,
      message: register.length ? `succesfully registered to event` : '',
      error: !register.length ? `an error ocurred` : '',
    })
})

router.delete('/:eventId', token.authenticateToken, async (req, res) => {
  const eventId  = req.params.eventId
  const eventDelete = await EventsService.deleteEvent(eventId)
  res.status(200).json({
    data: {},
    message: eventDelete ? `Event was deleted` : '',
    error: !eventDelete ? `Event not deleted. Verify ID` : '',
  })
})



router.get('/:eventId/speakers', async (req, res) => {
  const { eventId } = req.params;
  const { params } = req.body
  const event = await EventsService.getSpeakers({ params,eventId })
  res.status(200).json({
    data: event,
    message: event.length ? `Speakers fetched` : '',
    error: !event.length ? `speaker not fetched` : '',
  })
})


router.get('/:eventId/schedule', async (req, res) => {
  const { eventId } = req.params;
  const schedule = await EventsService.getSchedule({ eventId })
  res.status(200).json({
    data: schedule,
    message: schedule.length ? `schedule fetched` : '',
    error: !schedule.length ? `schedule not fetched` : '',
  })
})

router.post('/:eventId/speakers/new/', AWSLOAD.upload.single('picture'), token.authenticateToken, async (req, res) => {
  const  params  = req.body;
  const eventId = req.params.eventId;
  let picture
  if(req.file !== undefined){
    picture = req.file.filename
 }
  const speakerId = await EventsService.createSpeaker({params, eventId, picture})
  res.status(201).json({
    data: [],
    message: speakerId ? `Speaker has been succesfully added to your event`: '',
    error: !speakerId ? `Failed adding speaker`: ''
  })
})


router.post('/:eventId/speaker/:speakerId', token.authenticateToken, async (req, res) => {
  const  speakerId = req.params.speakerId;
  const eventId = req.params.eventId
  const speaker = await EventsService.addExistantSpeaker(speakerId, eventId)
  res.status(201).json({
    data: [],
    message: speaker ? `Speakerhas been succesfully added to your event`: '',
    error: !speaker ? `Failed adding speaker`: ''
  })
})






router.put('/speakers/:speakerId', token.authenticateToken,  async (req, res) => {
  const {speakerId} = req.params
  const params  = req.body
  const speaker = await EventsService.updateSpeaker({params, speakerId})
  res.status(200).json({
    data: [],
    message: speaker ? `Speakerhas been succesfully modified`: '',
    error: !speaker ? `Failed updating speaker`: ''
  })
})
router.put('/:eventId/publish', token.authenticateToken, async (req, res) => {
  const eventId = req.params.eventId
  const publish = await EventsService.publishEvent(eventId)
  res.status(200).json({
    data: {},
    message: publish ? `Your Event is now publish`: '',
    error: !publish ? `Failed updating speaker`: ''
  })
})

router.put('/:eventId/unpublish', token.authenticateToken, async (req, res) => {
  const eventId = req.params.eventId
  const publish = await EventsService.unpublishEvent(eventId)
  res.status(200).json({
    data: {},
    message: publish ? `status changed to created`: '',
    error: !publish ? `Failed updating event`: ''
  })
})


router.post('/:eventId/speaker/:speakerId/schedule/', token.authenticateToken, async (req, res) => {
  const params = req.body
  const speakerId = req.params.speakerId
  const eventId = req.params.eventId
  const scheduleId = await EventsService.addSchedule({ params , speakerId, eventId})
  res.status(201).json({ 
    data: [],
    message: scheduleId ? `Scheduled` : '',
    error: !scheduleId ? `Fails schedule` : '',
  })
})

router.put('/schedule/:scheduleId', token.authenticateToken, async (req, res) => {
  const params = req.body
  const scheduleId = req.params.scheduleId
  const scheduleUpdate = await EventsService.updateSchedule({ params , scheduleId})
  res.status(201).json({
    data: [],
    message: scheduleUpdate ? `Schedule updated` : '',
    error: !scheduleUpdate ? `Fails schedule` : '',
  })
})



router.post('/:eventId/users/',  async (req, res) => {
  const eventId = req.params.eventId
  const email = req.body.email
  const organizer = await EventsService.assignEventToOrganizer(eventId, email)
  res.status(201).json({ 
    data: [],
    message: organizer ? `organizer assigned to event` : '',
    error: !organizer ? `couldnt assign organizer` : '',
  })
})


module.exports = router
