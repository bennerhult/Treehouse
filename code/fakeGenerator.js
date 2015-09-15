module.exports = (function () {
    "use strict";

    var names = ['Agate',
'Alyvia',
'Arabeth',
'Ardra',
'Brenna',
'Caryne',
'Dasi',
'Derris',
'Dynie',
'Eryke',
'Errine',
'Farale',
'Gavina',
'Glynna',
'Karran',
'Kierst',
'Kira',
'Kyale',
'Ladia',
'Mora',
'Moriana',
'Quiss',
'Sadi',
'Salina',
'Samia',
'Sephya',
'Shaundra',
'Siveth',
'Thana',
'Valiah',
'Zelda',
'Alaric',
'Alaron',
'Alynd',
'Asgoth',
'Berryn',
'Derrib',
'Eryk',
'Evo',
'Fausto',
'Gavin',
'Gorth',
'Jarak',
'Jasek',
'Kurn',
'Lan',
'Ledo',
'Lor',
'Mavel',
'Milandro',
'Sandar',
'Sharn',
'Tarran',
'Thane',
'Topaz',
'Tor',
'Torc',
'Travys',
'Trebor',
'Tylien',
'Vicart',
'Zircon']

    var verbs = ['throw',
'fly',
'repair',
'catch',
'adopt',
'launch',
'swing',
'wake',
'hide',
'grow']

    var substantives = ['kitten',
'puppy',
'flower',
'pie',
'squirrel',
'acorn',
'hamster',
'tree']

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function generateSingleName() {
        return names[getRandomInt(0, names.length - 1)]
    }

    function generateFullName() {
        var firstName, lastName
        firstName = generateSingleName() + getRandomInt(1,99)
        lastName = generateSingleName() + getRandomInt(1,99)
        return {
            firstName : firstName,
            lastName : lastName
        }
    }

    function generateGoal() {
        var v, s, times;
        v = verbs[getRandomInt(0, verbs.length - 1)]
        s = substantives[getRandomInt(0, substantives.length - 1)]
        times = getRandomInt(2, 7)

        return {
            quantityTotal : times,
            quantityCompleted : 0,
            verb : v,
            substantive : s,
            title : v + ' ' + times + ' ' + s + 's',
            p : v + ' ' + s + 's'
        }
    }

    function generateAchievement(createdBy, createdDate) {
        var goals, nrOfGoals, g, a, desc

        a = { goals : [],
             createdBy,
             createdDate,
             imageURL : '/content/img/achievementImages/1.png'
            }
        nrOfGoals = getRandomInt(1, 10)
        goals = []

        for(var i=0; i<nrOfGoals; i++) {
            g = generateGoal()
            goals.push(g)
            a.goals.push({
                createdDate,
                title : g.title,
                quantityTotal : g.quantityTotal,
                quantityCompleted : 0
            })
            if(desc) {
                desc = desc + ' and ' + g.title
            } else {
                desc = g.title
            }
        }
        a.description = desc

        a.title = goals[0].p
        if(nrOfGoals > 1) {
            for(var i=1; i< Math.min(3, nrOfGoals); i++) {
                a.title = a.title + ' and ' + goals[i].p
            }
        }
        if(nrOfGoals > 3) {
            a.title = a.title + ' and more'
        }

        /* Do these do anything?
            issuedAchievement   : {type: Boolean, required: false},
            isIssued            : {type: Boolean, required: false},
            issuerName          : {type: String, required: false},
        */
        return a
    }

    function generateAchievements(createdBy, createdDate) {
        var a = []
        for(var i=0; i< getRandomInt(2, 5); i++) {
            a.push(generateAchievement(createdBy, createdDate))
        }
        return a
    }

    return {
        generateName : generateFullName,
        generateAchievement,
        generateAchievements,
        getRandomInt
    }
}())
