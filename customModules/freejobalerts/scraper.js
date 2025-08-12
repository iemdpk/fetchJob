const request = require('request');
const cheerio = require('cheerio');
const stateCodes =require('../../data/freeJobAlertStateMap.json');
//const log = require('signale');
const signale = require('signale');


function topicScraper(URL, topic,tableNO) {
    console.log("url this is fetch ",URL);
    var log = signale.scope("scraper:TopicScraper");
    const options = {
        url: URL,
        headers: {
            'User-Agent': 'request'
        }
    };
    var results = [];
    return new Promise((resolve,reject)=>{
        request.get(options,(error,response,html)=>{
            if(error)
            {
                log.error("could not fetch the source");
                reject(error);
            }
            else if(!error && response.statusCode === 200)
            {
                
                log.success("successfully fetched");
                const $ = cheerio.load(html);
                var allPosts = $('div.entry-content');
                log.log("this is all post ",allPosts);
                var topic = $(allPosts).find('table').eq(tableNO);
                // log.log(topic.html());
                var entries = $(topic).find('tr').toArray();
               // log.log(entries.length);


                let jobs = [];

              

                // Find all tables inside the main content
                $('div.entry-content table').each((tableIndex, tableElem) => {
                    if (tableIndex === 0) return; // skip first table

                    // Loop through each row (skip header row)
                    $(tableElem).find("tr").slice(1).each((_, row) => {
                    const cells = $(row).find("td").map((i, cell) => {
                        return $(cell).text().trim();
                    }).get();

                    const detailsLink = $(row).find("td:last-child a").attr("href") || "";

                    jobs.push({
                        postDate: cells[0] || "",
                        postBoard: cells[1] || "",
                        postName: cells[2] || "",
                        qualification: cells[3] || "",
                        advtNo: cells[4] || "",
                        lastDate: cells[5] || "",
                        link: detailsLink
                    });
                    });
                });

                if (jobs.length > 0) {
                  jobs.pop();
                }

                resolve(jobs);

    
            }
        })
    })
}

function latestNotifications(URL) {
var log = signale.scope("scraper:latestNotifications");
const options = {
    url: URL,
    headers: {
        'User-Agent': 'request'
    }
};

var results = [];
return new Promise((resolve, reject) => {

    request.get(options, (error, response, html) => {
        if (error) {
            log.error("could not fetch the source");
            reject(error);
        }
        else if (!error && response.statusCode === 200) {
            log.success("successfully fetched");
            const $ = cheerio.load(html);
            // log.log("data",$);
            const notifications = $('div.gb-inside-container').find('ul').toArray();
            log.log("notifications ",notifications)

            notifications.forEach((el, index) => {
                var result = {
                    title: "",
                    link: ""
                };
                var entry = $(el).first('li').find('a');
                result.title = $(entry).text();
                result.link = $(entry).attr('href');
                // add it to the list
                results.push(result);
            });
            log.log("fetched ",results);
            resolve(results);
        }

    });
});
}


//////////////////////////////////// state wise scraper ////////////////////////////////////










function smartScraper(URL,topic) {
    var log = signale.scope("scraper:stateWiseScraper");

    

    const options = {
        url: URL,
        headers: {
            'User-Agent': 'request'
        }
    };
    
    var results = [];
    return new Promise((resolve, reject) => {
    
        request.get(options, (error, response, html) => {
            if (error) {
                log.error("could not fetch the source");
                reject(error);
            }
            else if (!error && response.statusCode === 200) {
                log.success("successfully fetched");
                const $ = cheerio.load(html);

                const posts = $("div.post, div .post"); // flexible selector
    const tables = posts.find("table").toArray();

    let dataTable = null;

    // Find the table that has "Recruitment Board" in its header
    for (let table of tables) {
        const headerText = $(table).find("th").map((i, el) => $(el).text().trim()).get().join(" ");
        if (headerText.includes("Recruitment Board")) {
            dataTable = table;
            break;
        }
    }

    if (!dataTable) {
        return []; // no matching table found
    }

    const results = [];

    $(dataTable).find("tr").each((i, row) => {
        if (i === 0) return; // skip header

        const cells = $(row).find("td");
        if (cells.length < 7) return; // skip malformed rows

        results.push({
            postDate: $(cells[0]).text().trim(),
            postBoard: $(cells[1]).text().trim(),
            postName: $(cells[2]).text().trim(),
            qualification: $(cells[3]).text().trim(),
            advtNo: $(cells[4]).text().trim(),
            lastDate: $(cells[5]).text().trim(),
            link: $(cells[6]).find("a").attr("href") || ""
        });
    });
    
        resolve(results);
            }
    
        });
    });
    }






    // smartScraper("http://www.freejobalert.com/odisha-government-jobs/","West Bengal").then((data)=>{
    //     // signale.log(data);
    // }).catch((err)=>{
    //     // signale.error(err);
    // })

















module.exports.latestNotifications = latestNotifications;
module.exports.topicScraper = topicScraper;
module.exports.smartScraper=smartScraper;