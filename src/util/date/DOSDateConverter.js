
class DOSDateConverter {

    dateTimeToDOS(timestamp = new Date()) {
        let fatTime = 0;
        fatTime |= timestamp.getSeconds() >> 1;
        fatTime |= timestamp.getMinutes() << 5;
        fatTime |= timestamp.getHours() << 11;
        fatTime |= timestamp.getDate() << 16;
        fatTime |= (timestamp.getMonth() + 1) << 21;
        fatTime |= (timestamp.getFullYear() - 1980) << 25;
        return fatTime;
    }

    timeToDOS(timestamp = new Date()) {
        let fatTime = 0;
        fatTime |= timestamp.getSeconds() >> 1;
        fatTime |= timestamp.getMinutes() << 5;
        fatTime |= timestamp.getHours() << 11;
        return fatTime;
    }

    dateToDOS(timestamp = new Date()) {
        let fatTime = 0;
        fatTime |= timestamp.getDate();
        fatTime |= (timestamp.getMonth() + 1) << 5;
        fatTime |= (timestamp.getFullYear() - 1980) << 9;
        return fatTime;
    }

    dateTimeFromDOS(fatTime = 0, timestamp = new Date(0)) {
        timestamp.setSeconds(fatTime << 1 & 0b11111);
        timestamp.setMinutes(fatTime >> 5 & 0b111111);
        timestamp.setHours(fatTime >> 11 & 0b11111);
        timestamp.setDate(fatTime >> 16 & 0b11111);
        timestamp.setMonth((fatTime >> 21 & 0b1111) - 1);
        timestamp.setFullYear((fatTime >> 25 & 0b1111111) + 1980);
        return timestamp;
    }

    timeFromDOS(fatTime = 0, timestamp = new Date(0)) {
        timestamp.setSeconds(fatTime << 1 & 0b11111);
        timestamp.setMinutes(fatTime >> 5 & 0b111111);
        timestamp.setHours(fatTime >> 11 & 0b11111);
        return timestamp;
    }

    dateFromDOS(fatTime = 0, timestamp = new Date(0)) {
        timestamp.setDate(fatTime & 0b11111);
        timestamp.setMonth((fatTime >> 5 & 0b1111) - 1);
        timestamp.setFullYear((fatTime >> 9 & 0b1111111) + 1980);
        return timestamp;
    }

    dateTimeUTCToDOS(timestamp = new Date()) {
        let fatTime = 0;
        fatTime |= timestamp.getUTCSeconds() >> 1;
        fatTime |= timestamp.getUTCMinutes() << 5;
        fatTime |= timestamp.getUTCHours() << 11;
        fatTime |= timestamp.getUTCDate() << 16;
        fatTime |= (timestamp.getUTCMonth() + 1) << 21;
        fatTime |= (timestamp.getUTCFullYear() - 1980) << 25;
        return fatTime;
    }

    timeUTCToDOS(timestamp = new Date()) {
        let fatTime = 0;
        fatTime |= timestamp.getUTCSeconds() >> 1;
        fatTime |= timestamp.getUTCMinutes() << 5;
        fatTime |= timestamp.getUTCHours() << 11;
        return fatTime;
    }

    dateUTCToDOS(timestamp = new Date()) {
        let fatTime = 0;
        fatTime |= timestamp.getUTCDate();
        fatTime |= (timestamp.getUTCMonth() + 1) << 5;
        fatTime |= (timestamp.getUTCFullYear() - 1980) << 9;
        return fatTime;
    }

    dateTimeUTCFromDOS(fatTime = 0, timestamp = new Date(0)) {
        timestamp.setUTCSeconds(fatTime << 1 & 0b11111);
        timestamp.setUTCMinutes(fatTime >> 5 & 0b111111);
        timestamp.setUTCHours(fatTime >> 11 & 0b11111);
        timestamp.setUTCDate(fatTime >> 16 & 0b11111);
        timestamp.setUTCMonth((fatTime >> 21 & 0b1111) - 1);
        timestamp.setUTCFullYear((fatTime >> 25 & 0b1111111) + 1980);
        return timestamp;
    }

    timeUTCFromDOS(fatTime = 0, timestamp = new Date(0)) {
        timestamp.setUTCSeconds(fatTime << 1 & 0b11111);
        timestamp.setUTCMinutes(fatTime >> 5 & 0b111111);
        timestamp.setUTCHours(fatTime >> 11 & 0b11111);
        return timestamp;
    }

    dateUTCFromDOS(fatTime = 0, timestamp = new Date(0)) {
        timestamp.setUTCDate(fatTime & 0b11111);
        timestamp.setUTCMonth((fatTime >> 5 & 0b1111) - 1);
        timestamp.setUTCFullYear((fatTime >> 9 & 0b1111111) + 1980);
        return timestamp;
    }

}

export default new DOSDateConverter();
