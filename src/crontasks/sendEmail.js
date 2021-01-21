const pool = require('../lib/mysql')
const mailgun = require("mailgun-js");
const { grep } = require('shelljs');
const DOMAIN = 'mg.eventzi.site';
APIKEY = process.env.MAILGUNKEY
const mg = mailgun({apiKey: APIKEY, domain: DOMAIN});



getData= async() =>{
    let result
        try{
        let query = `select ea.email, e.event_name, ed.url, edi.title_, edi.message, ed.date_
        from events_assistant_unsigned as ea
          join events_detail ed on ea.id_event_ = ed.id_event_
          join events_ e on ea.id_event_ = e.id_event_
          join events_difusion edi on ea.id_event_ = edi.id_event_
          where date(ed.date_) - date(now()- interval 5 hour) = 1 `
        result = pool.query(query)
    }catch(err){
        console.error('There was an error retriving the emails')
    }
    return result || []
}
 preprocessData = async() => {
    let data = await getData()
    let emails = []
    let eventName = []
    let url = []
    let title = []
    let message = []
    if(data.length > 0){
        for(var i = 0; i < data.length; i ++){
            emails.push(data[i]["email"])
            eventName.push(data[i]["event_name"])
            url.push(data[i]["url"])
            title.push(data[i]["title_"])
            message.push(data[i]["message"])
            console.log(emails[i])
            await sendEmail(emails[i], eventName[i],title[i], message[i])

        }
    }

}

sendEmail = async(email, eventName, title, message) => {
    data = {
        from: `Eventzi Team<Team@${DOMAIN}>`,
        to: email,
        subject: `${title}`,
        text: `Hello there! your event ${eventName} its almost here and they have a message for you! \n\n
        ${message} \n Join at https://eventzi.vercel.app/`
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    })
}
preprocessData()
