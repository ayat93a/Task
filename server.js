`use strict`


// API given by NADSoft
const getUrl = '01101100 01101100 01100001 00101111 00110001 00101110 00110011 01110110 \
00101111 01101101 01101111 01100011 00101110 01110011 01100101 01101001 01110010 \
01110100 01101110 01110101 01101111 01100011 01110100 01110011 01100101 01110010 \
00101111 00101111 00111010 01110011 01110000 01110100 01110100 01101000';


const binaryToString = (binary = '') => {
   let strArr = binary.split(' ');
   const getUrl = strArr.map(part => {
      return String.fromCharCode(parseInt(part, 2));
   }).reverse().join('');
   return getUrl;
};

// let Url = binaryToString(getUrl)

// require 
const express = require('express');
const cors = require ( "cors");
const app = express();
const axios = require('axios');
const PORT = 3000
const pg = require('pg')
const fs = require('fs');
const { stringify } = require('querystring');
const { it } = require('node:test');

// Database is hosted in AWS using elephantsql - Postgresql
const db = new pg.Client(`postgres://vxyiumuo:Nw3YD08fml28HzDYOg6l3dFPgXvV6dFI@mouse.db.elephantsql.com/vxyiumuo`)

// middlewares
app.use(cors());
app.use(express.json());



// Routes 

// handel the 3rd party api data and handel the data storage to the database

// Get all countries
app.get('/' , countriesDetailsHandler);


// Get all countries From DB
app.get(`/all-countrieds-database` , getAllDataHandler)

// search about common name , official name , cca2 , cca3 , ccn3
app.get('/search' , handelSearch)

// currencies by CCA2
app.get('/currencies' , handelCurrencies)


// Group countries by region , language or both
app.get('/group' , groupHandler)

// Download 
app.get('/download-file' , downloadJsonHandler);


// Database handler
// app.post('/all-data' , saveAllDataHandler)
app.post('/save-third-party-data-normalized' , countriesDetailsSaver );
app.post('/countries-Languages' , countriesLanguagesHandler);
app.post('/Currencies' , countriesCurrenciesHandler);




// constractor 
function Countries(commonName ,officialName, 
    Languages, cca2 , cca3 , ccn3 , Currencies_name, Currencies_symbol , Region , latitude , longitude ){
   this.commonName = commonName ;
   this.officialName = officialName;
   this.Languages = Object.values(Languages) ;
   this.cca2 = cca2 ;
   this.cca3 = cca3;
   this.ccn3 = ccn3 ;
   this.Currencies_name = Object.values(Currencies_name ).map((item) =>{ return  item.name })  ;
   this.Currencies_symbol = Object.values(Currencies_symbol ).map((item) =>{ return  item.symbol})  ;
   this.Region = Region ;
   this.latitude = latitude ;
   this.longitude = longitude 
   
}

// Get the required data from the 3rd party API
function countriesDetailsHandler(req,res){
    Url = `https://restcountries.com/v3.1/all`
    

    axios.get(Url)
    .then ((data)=>{
        let countriesDetails = data.data.map(country => {
            return new Countries(
            country.name.common || " ",
            country.name.official || " ", 
            country.languages  || " " ,
            country.cca2 || " " , 
             country.cca3 || " " , 
            country.ccn3 || " " ,
             country.currencies|| " " ,
              country.currencies|| " " , 
              country.region || " "  , 
            country.latlng[0] || " " , 
             country.latlng[1] || " "
            )
        })
        res.json(countriesDetails).status(200)
        // fs.writeFileSync('./countries.json' , JSON.stringify())
    }).catch((err) => {
       res.send('no data to show')
    })   
    
}


// post the data to the database 

// save all the data 
// function saveAllDataHandler(req,res){
//     req.body = require('./countries.json')
//     let sql = `INSERT INTO all_data (
//         commonName  , officialName  ,languages,cca2  ,cca3  ,
//         ccn3  ,currencies_name,currencies_symbol,Region ,latitude_  ,longitude_  
//         ) VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9 , $10,$11);` 

//     let data = req.body

//     let values =  data.map((item) => {
//       return  [item.commonName , item .officialName, stringify(item.languages),
//             item.cca2 , item.cca3 , item.ccn3 , stringify(item.currencies_name), stringify(item.currencies_symbol),
//             item.Region,item.latitude , item.longitude]
//     })
//     for (i =0 ; i < values.length ; i++){
//         db.query(sql,values[i])
//     }   
// }



// retrieved_from_third_party_api table Normalized 
function countriesDetailsSaver(req,res ){
    req.body = require('./countries.json')
    let sql = `INSERT INTO retrieved_from_third_party_api (
        commonName  , officialName  ,cca2  ,cca3  ,
        ccn3  ,Region ,latitude_  ,longitude_  
        ) VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8);` 

    let data = req.body

    let values =  data.map((item) => {
      return  [item.commonName , item .officialName,
            item.cca2 , item.cca3 , item.ccn3 , item.Region,
            item.latitude , item.longitude]
    })
    for (i =0 ; i < values.length ; i++){
        db.query(sql,values[i])
    }   
}





// languages table
function countriesLanguagesHandler(req,res){
    req.body = require('./countries.json')
    let sql = `INSERT INTO languages (
        lan0 ,lan1,lan2,lan3,lan4,lan5,lan6,lan7,lan8,lan9,lan10,lan11,lan12,lan13,lan14,lan15
    ) VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7 ,$8 , $9 , $10 , $11 , $12 , $13 , $14,$15 ,$16 )`

    let data = req.body

    let values = data.map((item) => {
        return [item.Languages[0],item.Languages[1],item.Languages[2],item.Languages[3],item.Languages[4],item.Languages[5],
        item.Languages[6],item.Languages[7],item.Languages[8],item.Languages[9],item.Languages[10],item.Languages[11],
        item.Languages[12],item.Languages[13],item.Languages[14],item.Languages[15]]
    })

    for (i =0 ; i < values.length ; i++){
        db.query(sql,values[i])
    } 
}


// currencies table (include the cca2 ==> denormaloze but simpeler query)
function countriesCurrenciesHandler(req,res){
    req.body = require('./countries.json')
    let sql = `INSERT INTO currencies (
        cca2 , currencies_name_0 ,currencies_name_1 , currencies_name_2 , currencies_symbol_0 ,
        currencies_symbol_1 , currencies_symbol_2
    ) VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7  )`

    let data = req.body

    let values = data.map((item) => {
        return [item.cca2,
        item.Currencies_name[0],item.Currencies_name[1],item.Currencies_name[2],
        item.Currencies_symbol[0],item.Currencies_symbol[1],item.Currencies_symbol[2]]
    })

    for (i =0 ; i < values.length ; i++){
        db.query(sql,values[i])
    } 
}




// get All Data
function getAllDataHandler(req,res){
    let sql = `select * from retrieved_from_third_party_api 
    INNER JOIN languages
    ON retrieved_from_third_party_api.contry_id = languages.lan_id
    
    INNER JOIN currencies
    ON currencies.contry_id = languages.lan_id `
    
    db.query(sql).then((data) => {
        res.status(200).json(data.rows);
    }).catch((err) => {
        console.log(err)
    })
    
}



// handel search for offical name , common name , cca2 ,cca3 , ccn3
function handelSearch (req,res){
    let name = req.query.name
    let cca2 = req.query.cca2
    let cca3 = req.query.cca3
    let ccn3 = req.query.ccn3
    let searchUrl = `http://localhost:3000/`
    axios.get(searchUrl)
    .then((data) => {
        // console.log(data)
        let searchResults = data.data.filter((item) => {
                return item.commonName == name || item.officialName == name || item.cca2 == cca2 || item.cca3 == cca3 || item.ccn3 ==ccn3  
        })
        // console.log(searchResults)
        res.status(200).json(searchResults)
        
    }).catch((err)=>{
        console.log(err)
    })
    // console.log(req.query)
}

// Currencies by cca2
function handelCurrencies(req,res){
    let cca2 = req.query.cca2

    let searchUrl = `http://localhost:3000/`
    axios.get(searchUrl)
    .then((data)=> {
        let searchResults = data.data.filter((item) => {
           
            return item.cca2 == cca2
        })
        // console.log(searchResults)
        let result = searchResults.map((item)=>{return {'cca2' : item.cca2 , 'name':item.officialName , 
        'Currencies_name':item.Currencies_name ,'Currencies_symbol': item.Currencies_symbol}})
        res.status(200).send(result)
    })
}


// groupHandler
function groupHandler(req,res){
    let group = req.query.group

    let searchUrl = `http://localhost:3000/`
    axios.get(searchUrl)
    .then((data)=> {
       let searchResults = data.data.filter((item) => {
        return item.Region == group || item.Languages == group
       })
    // console.log(searchResults)
    res.status(200).json(searchResults)
    })
}


function downloadJsonHandler(req,res){
    console.log(res.headers)
   
    res.download('./countries.json')
}



db.connect().then(() => {
    app.listen(PORT , ()=>{console.log(`listen to ${PORT}`)})
})
 