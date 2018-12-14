var Lottery = artifacts.require("./Lottery.sol");

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

module.exports = function(deployer) {
    const ticketPrice = 28; // $5 in finney
    const ticketsPerPerson = 1;
    const fee = 10; // 10%
    const endingTime = Math.floor(Date.now() / 1000) + duration.weeks(1);
    const ticketAmount = 5;

    deployer.deploy(Lottery, ticketPrice, ticketsPerPerson, fee, endingTime, ticketAmount);
};