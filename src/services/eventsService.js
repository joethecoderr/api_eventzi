'use strict'

const { NULL } = require('mysql2/lib/constants/types')
const pool = require('../lib/mysql')
const AWS_LOAD = require('../lib/awsLoad')
const AWSLOAD = new AWS_LOAD

class EventsService {
  constructor() {}

  getEvents = async () => {
    let listEvents
    try {
      listEvents = await pool.query(`select e.*, ed.* from events_ as e 
      join events_detail ed on e.id_event_ = ed.id_event_ where e.status_ = 2`)
    } catch (err) {
      console.error('Error while getting list of events', err)
    }
    return listEvents || []
  }

  getUpcomingEvents = async () => {
    let listEvents
    try {
      listEvents = await pool.query(`select
      e.*, ed.*, if(ep.template, ep.template, 'Not assigned') as template, 
      if(LENGTH(ep.banner) > 0, ep.banner, 'No Banner') as banner,
      if(LENGTH(ep.logo) > 0 , ep.logo, 'No logo') as logo 
      from events_ as e 
      join events_detail ed on e.id_event_ = ed.id_event_ 
    left join events_post ep on ep.id_event_ = e.id_event_ 
    where e.status_ = 2 and ed.date_ > now() order by ed.date_ asc limit 8`)
    } catch (err) {
      console.error('Error while getting list of events', err)
    }
    return listEvents || []
  }

  getEvent = async ({ eventId }) => {
    let eventById
    try {
      eventById = await pool.query(
        `select
          e.*, ed.description_, ed.date_, ed.url, if(ep.template, ep.template, 'Not assigned') as template, 
          if(LENGTH(ep.banner) > 0, ep.banner, 'No Banner') as banner,
          if(LENGTH(ep.logo) > 0 , ep.logo, 'No logo') as logo 
          from events_ as e 
          join events_detail ed on e.id_event_ = ed.id_event_ 
        left join events_post ep on ep.id_event_ = e.id_event_
        where e.id_event_ = ?`,
        eventId
      )
    } catch (err) {
      console.error('Error while getting this event', err)
    }
    return eventById || []
  }

  getEverything = async (userId) => {
    let queryEvents = `select o.organization_name, e.*, ed.description_, ed.date_, ed.url , ep.logo, ep.banner, ep.template , IF(1, 'True', 'False') as IsAdmin from events_ as e
    left join events_detail ed on ed.id_event_ = e.id_event_
    left join events_post ep on ep.id_event_ = e.id_event_
    join organizations o on o.id_organization = e.id_organization
    where o.id_user = ?
    UNION
    select o.organization_name, e.*, ed.description_, ed.date_, ed.url , ep.logo, ep.banner, ep.template , IF(0, 'True', 'False') as IsAdmin from events_ as e
    left join events_detail ed on ed.id_event_ = e.id_event_
    left join events_post ep on ep.id_event_ = e.id_event_
    join users_events ue on ue.id_event_ = e.id_event_ 
    join organizations o on e.id_organization = o.id_organization
    where ue.id_user = ? and ue.relationship = 2`
    let querySpeakers = `select s.id_speaker, s.fullname, s.bio, s.twitter, s.picture, 
    s.status_, s.role_, ep.id_event_ from events_speakers as ep 
    join speakers s on s.id_speaker = ep.id_speaker
    where ep.id_event_ = ?`
    let querySchedule = `select id_speaker, title, description_, date_ from schedule_ 
    where  id_event_ = ? and id_speaker = ? `

    let events
    let eventId
    let speakerId
    let speakers
    let schedule
    let speakersArray = []
    let scheduleArray = []
    try {
      events = await pool.query(queryEvents,[userId, userId])
      if(events.length > 0){
        for(var i = 0; i < events.length; i++){
          eventId = events[i]["id_event_"]
          speakers =  await pool.query(querySpeakers, eventId)
          if(speakers.length > 0){
            for(var j = 0; j < speakers.length; j++){
              speakerId = speakers[j]['id_speaker']
              if(events[i]["id_event_"] === speakers[j]["id_event_"]){
                speakersArray.push(speakers[j])
                events[i]["speakers"] = speakersArray
              }//
              schedule = await pool.query(querySchedule,[eventId, speakerId])
              if(schedule.length > 0){
                for(var k = 0; k < schedule.length; k++){
                  console.log('speaker id: ',  speakers[j]['id_speaker'])
                  console.log('id speaker en schedule', schedule[k]['id_speaker'])
                  if(speakers[j]['id_speaker'] === schedule[k]['id_speaker']){
                    scheduleArray.push(schedule[k])
                    speakers[j]["schedule"] == scheduleArray
                  }
                }
              }//
            }
            speakersArray = []
            scheduleArray = []
          }
        }
      }
    } catch (err) {
      console.error('Error while getting this event', err)
    }
    return events || []
  }

  
  getEventMedia = async ({ eventId }) => {
    let eventById
    try {
      eventById = await pool.query(
        `select
          if(LENGTH(banner) > 0, banner, 'No Banner') as banner,
          if(LENGTH(logo) > 0 , logo, 'No logo') as logo 
          from events_post where id_event_ = ?`,
        eventId
      )
    } catch (err) {
      console.error('Error while getting this event', err)
    }
    return eventById || []
  }

  getEventMediaLogo = async ({ eventId }) => {
    let eventById
    try {
      eventById = await pool.query(
        `select 
          if(LENGTH(logo) > 0 , logo, 'No logo') as logo 
          from events_post where id_event_ = ?`,
        eventId
      )
    } catch (err) {
      console.error('Error while getting this event', err)
    }
    return eventById || []
  }


  getEventsByOrganizer = async (userId) => {
    let events
    try {
      events = await pool.query(
        `select ue.id_user_event, e.*, ed.*, u.id_user from users_events as ue
        join events_ e on e.id_event_ = ue.id_event_
        join events_detail ed on ed.id_event_ = ue.id_event_
        join users u on u.id_user = ue.id_user
        where ue.relationship = 2 and ue.id_user = ? and ue.status_ = 1`,
        userId
      )
    } catch (err) {
      console.error('Error while getting this event', err)
    }
    return events || []
  }
  deleteOrganizer = async (organizerId) => {
    let events
    try {
      events = await pool.query(
        `update users_events set status_ = 0 where id_user_event = ?`,
        organizerId
      )
    } catch (err) {
      console.error('Error while getting this event', err)
    }
    return events || {}
  }
  

  createEvent = async ({ params, organizationId, logo, banner }) => {
    let queryLastInsert = `select e.*, ed.* from events_ as e 
    join events_detail ed on ed.id_event_ = e.id_event_ where e.id_event_ = ?`
    let query = `insert into events_ set id_organization = ?, event_name = ?, event_type = ?`
    let queryDetails = `insert into events_detail set id_event_ = ?, description_ = ?, date_ = ?, url = ?`
    let queryPost = `insert into events_post set id_event_ = ?, logo = ? , banner  = ?, template = ?, colors = ?`
    let inserted_id

    try {
      let result = await pool.query(query, [
        organizationId,
        params.event_name,
        params.event_type
      ])

      inserted_id = result.insertId
    } catch (err) {
      console.error('There was an error registering your event', err)
    }

    if (inserted_id) {
      try {
        await pool.query(queryDetails, [
          inserted_id,
          params.event_description,
          params.date,
          params.url,
        ])

      } catch (err) {
        console.error('Error while when inserting to DB', err)
      }
      try {
        await pool.query(queryPost, [inserted_id,
          AWSLOAD.uploadPhoto( logo, 'eventLogo'), 
          AWSLOAD.uploadPhoto( banner, 'eventBanner'), 
          params.template,
          params.colors]) 
          const result = await pool.query(queryLastInsert, inserted_id)
          return result || []
          
      } catch(err){
        console.error(err, 'Error while setting configs of event')
      }
    }

    return null
  }


  addExistantSpeaker = async ( speakerId, eventId ) => {
    let queryLinkSpeakerToEvent = `insert into events_speakers set id_event_ = ?, id_speaker = ?`
    try {
      let result = await pool.query(queryLinkSpeakerToEvent, [
        eventId,
        speakerId,
      ])

      return result.insertId
    } catch (err) {
      console.error('There was an error registering your event', err)
    }

    return null
  }

  updateEvent = async ({ eventId, params }) => {
    let queryLastUpdate = `select e.*, ed.*, ep.template from events_ as e 
    join events_detail ed on ed.id_event_ = e.id_event_ 
    join events_post ep on ep.id_event_ = e.id_event_ where e.id_event_ = ?`
    let updateEvent, updateEventDetails
    let query = `update events_ set  
    event_name = ?, event_type = ? where id_event_ = ?`
    let query_details = `update events_detail set  description_ = ?, date_ = ?, url = ? where id_event_ = ?`
    let query_post = `update events_post set  template = ? where id_event_ = ?`
    try {
      console.log('wtf', params.event_name)
      updateEvent = await pool.query(query, [
        params.event_name,
        params.event_type,
        eventId,
      ])
    } catch (err) {
      console.error('Error while updating records', err)
      return null
    }


    try {
      updateEventDetails = await pool.query(query_details, [
        params.description_,
        params.date_,
        params.url,
        eventId,
      ])

    } catch (err) {
      console.error('Error while updating records', err)
    }
    
    try {
      const updateEventPost = await pool.query(query_post, [
        params.template,
        eventId,
      ])

    } catch (err) {
      console.error('Error while updating records', err)
    }
    
    const result = await pool.query(queryLastUpdate, eventId)
    return result || []
  }

  updateEventMediaBanner = async ({ eventId, banner }) => {

    let query = `update events_post set banner = ? where id_event_ = ?`
    try {
      const updateEvent = await pool.query(query, [
        AWSLOAD.uploadPhoto(banner, 'eventBanner'),
        eventId,
      ])
      return updateEvent || {}
    } catch (err) {
      console.error('Error while updating records', err)
      return null
    }

  }
  updateEventMediaLogo = async ( {eventId, logo} ) => {

    let query = `update events_post set  
    logo = ? where id_event_ = ?`
    try {
      const updateEvent = await pool.query(query, [
        AWSLOAD.uploadPhoto(logo, 'eventLogo'),
        eventId,
      ])
      return updateEvent || {}
    } catch (err) {
      console.error('Error while updating records', err)
      return null
    }

  }

  deleteEvent = async (eventId) => {
    console.error(eventId)
    let deleteEvent
    let query = `update events_ set status_ = 4 where id_event_ = ?`
    try {
      deleteEvent = await pool.query(query, eventId)
    } catch (err) {
      console.error('Error while deleting record', err)
    }
    if (deleteEvent.affectedRows) {
      return eventId
    }
    return null
  }

  getSchedule = async ({eventId}) => {
    let schedule
    try {
      schedule = await pool.query(`select sc.title, sc.description_, sc.date_, sp.fullname,
      sp.bio, sp.twitter, sp.role_ from schedule_ as sc 
      join speakers sp on sc.id_speaker = sp.id_speaker where sc.id_event_ = ? `, [eventId])
    } catch (err) {
      console.error('Error while getting list of events', err)
    }
    return schedule || []
  }

  addSchedule = async ({ params, speakerId, eventId }) => {
    let queryAddSchedule = `insert into schedule_ set 
      id_speaker = ?, id_event_ = ?, title = ?, description_ = ?, date_ = ?`
    try {
      let newSchedule = await pool.query(queryAddSchedule, [
        speakerId,
        eventId,
        params.title,
        params.description_,
        params.date_,  

      ])
      return newSchedule

    } catch (err) {
      console.error('There was an error registering your event', err)
    }

    
  }

  registerToEvent = async ( email, eventId ) => {
    let query = `insert into events_assistant_unsigned set id_event_ = ?, 
    email = ?`
    try {
      const register = await pool.query(query, [eventId, email])
      return register || []

    } catch (err) {
      console.error('There was an error registering you to the event', err)
    }
  }
  updateSchedule = async ({ params, scheduleId }) => {
    let updateSchedule
    let query = `update schedule_ set title = ?, description_ = ?, date_ = ? where id_schedule = ?`
    try {
      updateSchedule = await pool.query(query, [
        params.title,
        params.description_,
        params.date_,
        scheduleId,
      ])
      return updateSchedule
    } catch (err) {
      console.error('Error while updating records', err)
      return null
    }
  }
  getSpeakers = async ({eventId}) => {
    let speakersSchedule
 
    try { 
      speakersSchedule = await pool.query(`select sc.title, sc.description_, sc.date_, sp.id_speaker, sp.fullname,
      sp.bio, sp.twitter, sp.role_ from schedule_ as sc 
      join speakers sp on sc.id_speaker = sp.id_speaker where sc.id_event_ = ? `, [eventId])
      /*
      listSpeakers = await pool.query(`select e.id_event_, s.*, e.event_name from events_speakers as es
      join speakers s on s.id_speaker = es.id_speaker
      join events_ e on e.id_event_ = es.id_event_
      where es.id_event_ = ?`, [eventId]) */
    } catch (err) {
      console.error('Error while getting list of events', err)
    }
    return speakersSchedule || []
  }

  createSpeaker = async ({ params, eventId, picture }) => {
    let queryGetOrg = `select id_organization from events_ where id_event_ = ? `
    let queryAddSpeaker = `insert into speakers set 
      id_organization = ?, fullname = ?, bio = ?, twitter = ?, picture = ?, status_ = 1, role_ = ?`
    let queryLinkSpeakerToEvent = `insert into events_speakers set id_event_ = ?, id_speaker = ?`
    let queryAddSchedule = `insert into schedule_ set 
    id_speaker = ?, id_event_ = ?, title = ?, description_ = ?, date_ = ?`

    let inserted_id;
    let organizationId;
    console.log('Entre')
    try{
        let  organization = await pool.query(queryGetOrg, [eventId])
        organizationId = organization[0]["id_organization"]
    }catch(err){
        console.error(err)
    }
    if(organizationId){
      try {
        let result = await pool.query(queryAddSpeaker, [
          organizationId,
          params.fullname,
          params.bio,
          params.twitter,
          AWSLOAD.uploadPhoto(picture, 'speakerPhoto'),
          params.role_,
        ])

        inserted_id = result.insertId
      } catch (err) {
        console.error('There was an error registering your event in post', err)
      }

      if (inserted_id) {
        try {
          await pool.query(queryLinkSpeakerToEvent, [
            eventId,
            inserted_id,
          ])
          
        } catch (err) {
          console.error('Error while when inserting to DB', err)
        }
        try {
          const newSchedule = await pool.query(queryAddSchedule, [
            inserted_id,
            eventId,
            params.title,
            params.description_,
            params.date_,  
            
          ])
          console.log('Agregue el scheduel')
          return newSchedule
          }catch(err){
            console.log(err)
          }


      }
    }
    return null
  }
  updateSpeaker = async ({params,  speakerId }) => {
    let queryAddSpeaker = `update speakers set 
       fullname = ?, bio = ?, twitter = ?, status_ = ?, role_ = ?
      where id_speaker = ?`
    let updateSchedule
    try {
      const result = await pool.query(queryAddSpeaker, [
        params.fullname,
        params.bio,
        params.twitter,
        params.status_,
        params.role_,
        speakerId
      ])
      

    } catch (err) {
      console.error('There was an error registering your event in out', err)
    }
    let query = `update schedule_ set title = ?, description_ = ?, date_ = ? where id_speaker = ?`
    try {
      updateSchedule = await pool.query(query, [
        params.title,
        params.description_,
        params.date_,
        speakerId,
      ])
    } catch (err) {
      console.error('Error while updating records', err)
    }
    return updateSchedule || {}
    
  }
  getPartners = async ({eventId}) => {
    let listSpeakers
    try {
      listSpeakers = await pool.query(`select p.* from partners_events as pe 
      join events_ on e.id_event_ = pe.id_event_ 
      join partners_ p on p.id_partner = pe.id_parner 
      where pe.id_event_ = ?`, [eventId])
    } catch (err) {
      console.error('Error while getting list of events', err)
    }
    return listSpeakers || []
  }

  assignEventToOrganizer = async (eventId, email) => {
    let querySearch = `select id_user from users where email = ? limit 1`
    let query = `insert into users_events set id_user = ?, id_event_ = ?, relationship  = 2`
    let userId
    let assign
    try {
      const search = await pool.query(querySearch, email)
      userId = search[0]['id_user']
      if(search.length > 0){
        assign = await pool.query(query, [userId, eventId])
      }
      else{
        return {}
      }
      
    } catch(err){
      console.error('Error while assigning organizer to event', err)
    }
    return assign || {}
  }

  publishEvent = async (eventId) => {
    let queryCheckInfo = `select 
    IF(LENGTH(ed.date_)>0  and LENGTH(ed.description_)>0, 1, null) 
    as Complete 
    from events_ as e
    join events_post ep on ep.id_event_ = e.id_event_
    join events_detail ed on ed.id_event_ = e.id_event_ 
    where e.id_event_ = ?`
    let queryPublish = `update events_ set status_ = 2 where id_event_ = ?`
    try {
      const checkInfo = await pool.query(queryCheckInfo, [eventId])
      if(checkInfo[0]["Complete"] == 1){
        try{
          const publish = await pool.query(queryPublish, [eventId])
          return publish || {}
        } catch(err){
          console.error('Error when trying to publish your event')
        }
      }else{
        return null
      }
    } catch(err){
      console.error('Error getting info of your event', err)
    }
  }

  unpublishEvent = async (eventId) => {
    let query = `update events_ set status_ = 1 where id_event_ = ?`
    let unpublish
    try {
      unpublish = await pool.query(query, [eventId])
      
    } catch(err){
      console.error('Error getting info of your event', err)
    }
    return unpublish || {}
  }

  getEventsByAdmin = async ( userId ) => {
     let query = `select e.id_event_, concat(o.organization_name, ' | ', e.event_name) as event_name, 
     ed.id_event_detail, ed.description_, ed.date_, ed.url  from events_ as e 
     left join events_detail ed on ed.id_event_ = e.id_event_ 
     join organizations o on o.id_organization = e.id_organization 
     where o.id_user = ? and  e.status_ in (1, 2)`
     try {
       
       const organizers = await pool.query(query, [ userId])
       return organizers || []
     } catch (err) {
       console.error('Error while getting list of events', err)
     }
   }

  
}

module.exports = EventsService
