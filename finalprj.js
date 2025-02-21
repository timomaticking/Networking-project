const fs = require("fs");
const http = require("http");
const https = require("https");
const url = require("url");
const port = 3000;

const server = http.createServer();
server.on("request", request_handler);
server.listen(port);

function request_handler(req, res) {
    console.log(`Request from ${req.socket.remoteAddress} for ${req.url}`);
    // Root page
    if (req.url === '/') {
        res.writeHead(200, "OK", { 'Content-Type': 'text/html' });
        const form = fs.createReadStream("finalproj.html");
        form.pipe(res); 
    }
    else if (req.url.startsWith("/print")) {
        res.writeHead(200, "OK", { 'Content-Type': 'text/html' });
        const user_input = new URL(req.url, `https://${req.headers.host}`).searchParams;
        const state = user_input.get("state")
        const country = user_input.get ("country");
        openweathermap(state, country, res);
        
    }
    else {
        res.writeHead(200, "OK", { 'Content-Type': 'text/html' });
        res.end('404 not found (you may have entered something wrong');
    }

}
server.on("listening", () => {
    console.log(`Now Listening on Port: ${port}`);
})

function openweathermap(state, country, res) {
    const check = `https://api.openweathermap.org/data/2.5/weather?q=${state},${country}&APPID=please-put-your-api-key-here`
    //const options = { method: "GET", headers: { accept: "application/json" } };
    const journeystart = https.request(check); //send url to API
    journeystart.on("response", thefirstquest);
    journeystart.end();
    //API data gets manhandled
    function thefirstquest(APIdata) {
        let data = " ";
        APIdata.on("data", (chunk) => {
            data += chunk;
        })
            
        APIdata.on("end", () => { store ((data), res) });
                
            }
}
function store(inpy, res) {
    try {
        const obj = JSON.parse(inpy);
        const longitude = obj.coord.lon;
        const latitude = obj.coord.lat;
        const weathermain = obj.weather[0].main;
        const weatherdescription = obj.weather[0].description;
        const maintemp = obj.main.temp;
        const tempfeelz = obj.main.feels_like;
        const tempmin = obj.main.temp_min;
        const tempmax = obj.main.temp_max;
        const airpressure = obj.main.pressure;
        const humidity = obj.main.humidity;
        const visibility = obj.visibility;
        const windspeed = obj.wind.speed;
        //    const timezone = obj.timezone;
        const name = obj.name;
    
        
        
        console.log(maintemp);

        suntracker(longitude, latitude, weathermain, weatherdescription, maintemp, tempfeelz, tempmin, tempmax, airpressure, humidity, visibility, windspeed, name, res);
    } catch (error) {
            console.error("Error parsing weather data or accessing properties:", error.message);

            res.writeHead(500, "Internal Server Error", { 'Content-type': 'text/html' });
            res.end(`<h1> 404 Error retrieving weather data. Please try again <h1>`);
        }
    }



function suntracker(longo, lat, weathermain, weatherdescription, maintemp, tempfeelz, tempmin, tempmax, airpressure, humidity, visibility, windspeed, name, res) {
    const givemesun = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${longo}`;
    const givit = https.request(givemesun);
    givit.on("response", thesecondquest);
    givit.end();

    //now we parse it into json again
    function thesecondquest(sundate) {
        let sunsy = " ";
        sundate.on("data", (chunk) => {
            sunsy += chunk
        })
        sundate.on ("end", () => { sunning((sunsy),longo, lat, weathermain, weatherdescription, maintemp, tempfeelz, tempmin, tempmax, airpressure, humidity, visibility, windspeed, name, res) });
    }
}

function sunning(unck, longo, lat, weathermain, weatherdescription, maintemp, tempfeelz, tempmin, tempmax, airpressure, humidity, visibility, windspeed, name, res) {
    const info = JSON.parse(unck);
    const date = info.results.date;
    const sunrise = info.results.sunrise;
    const sunset = info.results.sunset;
    const firstlight = info.results.first_light;
    const lastlight = info.results.last_light;
    const dawn = info.results.dawn;
    const dusk = info.results.dusk;
    const solar_noon = info.results.solar_noon;
    const golden_hour = info.results.golden_hour;
    const day_length = info.results.day_length;
    const timezone = info.results.timezone;

    
    Printo(date, sunrise, sunset, firstlight, lastlight, dawn, dusk, solar_noon, golden_hour, day_length, timezone, longo, lat, weathermain, weatherdescription, maintemp, tempfeelz, tempmin, tempmax, airpressure, humidity, visibility, windspeed, name, res);
}
        function Printo(date, sunrise, sunset, firstlight, lastlight, dawn, dusk, solar_noon, golden_hour, day_length, timezone, longo, lat, weathermain, weatherdescription, maintemp, tempfeelz, tempmin, tempmax, airpressure, humidity, visibility, windspeed, name, res){

        let blast = `<h1>Here are the weather facts and sunrise in ${name}    </h1>
     <h1> Date: ${date} </h1>
     <h1> weatherdescription ${weatherdescription} <h1>
     <h1> Sunrise: ${sunrise} </h1>
     <h1> Sunset: ${sunset} </h1>
     <h1> firstlight: ${firstlight} <h1>
     <h1> lastlight: ${lastlight} <h1>
     <h1> dawn: ${dawn} <h1> 
     <h1> dusk: ${dusk} <h1>
     <h1> solar_noon: ${solar_noon} <h1>
     <h1> golden_hour: ${golden_hour} <h1>
     <h1> day_length: ${day_length} <h1>
     <h1> timezone: ${timezone} <h1>
     <h1> longo: ${longo} <h1>
     <h1> lat: ${lat} <h1>
     <h1> weathermain: ${weathermain} <h1>
     <h1> maintemp: ${maintemp} <h1>
     <h1> tempfeelz: ${tempfeelz} <h1>
     <h1> minimum temperature: ${tempmin} <h1>
     <h1> maximum temperature: ${tempmax} <h1>
     <h1> air pressure : ${airpressure} <h1>
     <h1> humidity: ${humidity} <h1>
      <h1> visibility: ${visibility} <h1>
      <h1> windspeed: ${windspeed} <h1>
    
    `;
        res.writeHead(200, "OK", { 'Content-Type': 'text/html' });
        res.end(blast)
    
    }

