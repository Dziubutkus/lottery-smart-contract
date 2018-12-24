//const { ether } = require('./helpers/ether');
const { ethGetBalance } = require('./helpers/web3');
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

contract('Lottery', function (accounts) {
    const ticketPrice = 28; // $5 in finney
    const ticketsPerPerson = 2;
    const fee = 10; // 10%
    const endingTime = Math.floor(Date.now() / 1000) + duration.weeks(1);
    const ticketAmount = 2;

    owner = accounts[0];

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
                this.lottery.buyTicket({from: accounts[1], value: web3.utils.toWei(web3.utils.toBN(ticketPrice - 1), 'finney')})
            );
        });

        it('should buy the ticket when the price is correct', async function () {
            await this.lottery.buyTicket({from: accounts[1], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
        });

        it('should not be able to buy more than max tickets per person', async function () {
            await this.lottery.buyTicket({from: accounts[1], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
            await assertRevert(
                this.lottery.buyTicket({from: accounts[1], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')})
            );
        });

        it('should not be able to buy more than max lottery tickets', async function () {
            await assertRevert(
                this.lottery.buyTicket({from: accounts[1], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')})
            );
        });

        it('random person should not be able to finalize the lottery', async function() {
            await assertRevert(
                this.lottery.finishLottery({from: accounts[1]})
            );
        });

        it('should not be able to buy tickets when lottery is ended', async function() {
            //await increase(duration.weeks(1));
            await assertRevert(
                this.lottery.buyTicket({from: accounts[1], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')})
            );
        });

        it('only owner should be able to finalize the lottery', async function() {
            await this.lottery.finishLottery({from: owner});
            var temp = await this.lottery.uniqueOwners.call();
            console.log("# of Unique owners: " + temp);
            console.log("Unique Owners: ");
            var l;
            for(l = 0; l < temp; l++) {
                console.log(await this.lottery.uniqueTicketOwners.call(l));
            }
        });

        it('should set a timeout for the test', async function() {
            function timeout(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        
            await timeout(20000);
        });

        it('after timeout', async function() {
            await this.lottery.processWinnings({ from: owner });
            var temp = await this.lottery.uniqueOwners.call();
            console.log("# of Unique owners: " + temp);
            console.log("Unique Owners: ");
            var l;
            for(l = 0; l < temp; l++) {
                console.log(await this.lottery.uniqueTicketOwners.call(l));
            }
            //console.log(await this.lottery.uniqueTicketOwners.call(0));

        });
        /*
        it('redo 10 lotteries', async function() {
            var i;
            for(i = 0; i < 10; i++) {
                console.log("Check tickets");
                var j;
                for(j = 1; j < 9; j++) {
                    console.log(await this.lottery.ownerTicketCount.call(accounts[j]));
                }
                
                await this.lottery.restartLottery(ticketPrice, 1, fee, endingTime, 8, { from: owner });
                // buy tickets
                await this.lottery.buyTicket({from: accounts[1], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[2], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[3], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[4], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[5], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[6], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[7], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[8], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                // end the lottery
                await this.lottery.finishLottery({ from: owner });
                // process winnings
                console.log("Delete");
                var k;
                var temp = await this.lottery.uniqueOwners.call();
                console.log("# of Unique owners: " + temp);
                console.log("Unique Owners: ");
                var l;
                for(l = 0; l < temp; l++) {
                    console.log(await this.lottery.uniqueTicketOwners.call(l));
                }
                console.log("Owner Ticket Count");
                for(k = 0; k < temp; k++) {
                    console.log(await this.lottery.ownerTicketCount.call(accounts[k+1]));
                }
                // wait for oraclize answer
                function timeout(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                await timeout(25000);
                console.log(i + " iteration winner: " + await this.lottery.winner.call() + " " + await this.lottery.winnerAddress.call() );

                await this.lottery.processWinnings({ from: owner });
            }
        });
        */
       
        it('cancel and restart 10 lotteries', async function() {
            var i;
            for(i = 0; i < 10; i++) {
                console.log("Check tickets");
                var j;
                for(j = 1; j < 9; j++) {
                    console.log(await this.lottery.ownerTicketCount.call(accounts[j]));
                }
                
                await this.lottery.restartLottery(ticketPrice, 1, fee, endingTime, 8, { from: owner });
                // buy tickets
                await this.lottery.buyTicket({from: accounts[1], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[2], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[3], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[4], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[5], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[6], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[7], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                await this.lottery.buyTicket({from: accounts[8], value: web3.utils.toWei(web3.utils.toBN(ticketPrice), 'finney')});
                // end the lottery
                await this.lottery.cancelLottery({ from: owner });
                // process winnings
                console.log("Delete");
                var k;
                var temp = await this.lottery.uniqueOwners.call();
                console.log("# of Unique owners: " + temp);
                console.log("Unique Owners: ");
                var l;
                for(l = 0; l < temp; l++) {
                    console.log(await this.lottery.uniqueTicketOwners.call(l));
                }
                console.log("Owner Ticket Count");
                for(k = 0; k < temp; k++) {
                    console.log(await this.lottery.ownerTicketCount.call(accounts[k+1]));
                }
                // wait for oraclize answer
                function timeout(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                await timeout(25000);
                console.log(i + " iteration winner: " + await this.lottery.winner.call() + " " + await this.lottery.winnerAddress.call() );

                //await this.lottery.processWinnings({ from: owner });
            }
        });
    });
});
