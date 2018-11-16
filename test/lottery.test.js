//const { ether } = require('./helpers/ether');
//const { getBalance } = require('./helpers/balance');
const { assertRevert } = require('./helpers/assertRevert');
const { increaseTo } = require('./helpers/time');
const { increase } = require('./helpers/time');


const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Lottery = artifacts.require('Lottery');

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

contract('Lottery', function ([owner, participant1]) {
    const ticketPrice = 28; // $5 in finney
    const ticketsPerPerson = 1;
    const fee = 10; // 10%
    const endingTime = Math.floor(Date.now() / 1000) + duration.weeks(1);
    const ticketAmount = 1;

    describe('deploying contract', function () {
        it('should not deploy with wrong ticket price', async function () {
            await assertRevert (
                Lottery.new(0, ticketsPerPerson, fee, endingTime, ticketAmount)
            );
        });
        
        it('should not deploy with wrong ticket amount', async function () {
            await assertRevert (
                Lottery.new(ticketPrice, ticketsPerPerson, fee, endingTime, 0)
            );
        });

        it('should not deploy with wrong ending time', async function () {
            await assertRevert (
                Lottery.new(ticketPrice, endingTime, fee, Math.floor(Date.now() / 1000) - duration.days(1), ticketAmount)
            );
        });
        
    });

    before(async function () {
        this.lottery = await Lottery.new(ticketPrice, ticketsPerPerson, fee, endingTime, ticketAmount, {from: owner});
    });

    describe('buying tickets', function () {
        it('should revert when amount is lower than the price', async function () {
            await assertRevert (
                this.lottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice - 1, 'finney')})
            );
        });

        it('should buy the ticket when the price is correct', async function () {
            await this.lottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')});
        });

        it('should not be able to buy more than max tickets per person', async function () {
            let testLottery = await Lottery.new(ticketPrice, 2, fee, endingTime, ticketAmount);
            await testLottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')});
            await testLottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')});
            await assertRevert(
                testLottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')})
            );
        });

        it('should not be able to buy more than max lottery tickets', async function () {
            let testLottery = await Lottery.new(ticketPrice, 5, fee, endingTime, 2);
            await testLottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')});
            await testLottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')});
            await assertRevert(
                testLottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')})
            );
        });

        it('random person should not be able to finalize the lottery', async function() {
            await assertRevert(
                this.lottery.finishLottery({from: participant1})
            );
        });

        it('should not be able to buy tickets when lottery is ended', async function() {
            await increase(duration.weeks(1));
            await assertRevert(
                this.lottery.buyTicket({from: participant1, value: web3.toWei(ticketPrice, 'finney')})
            );
        });

        it('only owner should be able to finalize the lottery', async function() {
            //var ending = this.lottery.endingTime.call();
            //var timestamp = block.timestamp;
            //console.log(ending < timestamp);
            console.log(await this.lottery.lotteryEnded());
            await this.lottery.finishLottery({from: owner});
        });
    });
});
