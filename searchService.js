const ACTIVE_STATUS = require("../constants/activeStatus")
const TUTORING_TYPE = require("../constants/tutoringType")
const TutorModel = require("../models/tutor")

let searchTutors = async (searchFilter, pageSize = 10, pageNumber = 1) => {
    let subjects = searchFilter.subjects ? searchFilter.subjects : []
    let minPrice = searchFilter.minPrice ? Number(searchFilter.minPrice) : 0
    let maxPrice = searchFilter.maxPrice ? Number(searchFilter.maxPrice) : Infinity
    let tutoringOptions = searchFilter.tutoringOptions ? searchFilter.tutoringOptions : [...TUTORING_TYPE]

    let filter = {
        subjects: { $in: subjects.map((subject) => new RegExp(subject, 'i')) },
        $and: [
            { rate: { $gte: minPrice } },
            { rate: { $lte: maxPrice } },
        ],
        tutoringType: { $in: tutoringOptions.map((option) => new RegExp(option, 'i')) },
        currentStatus: ACTIVE_STATUS[0]
    };
    if (searchFilter.locations) {
        filter.location = { $in: searchFilter.locations.map((location) => new RegExp(location, 'i')) }
    }

    if (searchFilter.universities) {
        filter['education.universityName'] = { $in: searchFilter.universities.map((university) => new RegExp(university, 'i')) };
    }

    let matchingTutorsCount = await TutorModel.countDocuments(filter)

    let matchingTutors = await TutorModel.find(filter)
        .populate('userId')
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)

    return { tutors: matchingTutors, totalCount: matchingTutorsCount }
}


module.exports = {
    searchTutors
}