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
    return {
        generateName : generateFullName
    }
}())
