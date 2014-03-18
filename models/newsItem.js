var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var NewsItemSchema = new Schema({
    createdDate     : Date,
    eventType       : {type: String, required: true},
    newsJson        : {type: String, required: true}
})

var NewsItem = mongoose.model('NewsItem', NewsItemSchema)

module.exports = {
    NewsItem: NewsItem,
    createNewsItem: createNewsItem
}

function createNewsItem(eventType, newsJson, callback) {
    var newsItem = new NewsItem()
    newsItem.createdDate = new Date()
    newsItem.eventType = eventType
    newsItem.newsJson = newsJson
    callback(newsItem)
}