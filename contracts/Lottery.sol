pragma solidity ^0.4.24;

import "./Pausable.sol";
import "./SafeMath.sol";


contract Lottery is Pausable {
    using SafeMath for uint;

    uint public ticketPrice;
    uint public endingTime;
    uint public ticketsSold;
    uint public uniqueOnwers;
    uint public ticketAmount;
    uint public ticketsPerPerson;
    uint public fee;

    event LotteryCreated(uint ticketPrice);
    event LotteryCanceled(); // TODO: what params should we emit?
    event LotteryFinished(address winner, uint ticketsSold, uint amountWon); 
    event TicketPurchased(address buyer);

    enum State {Active, Inactive}
    State state;

    address[] uniqueTicketOwners;
    mapping (uint => address) ticketToOwner;
    mapping (address => uint) ownerTicketCount;

    /**
    * @dev For an unlimited amount of tickets in the lottery for its duration, set ticketAmount = 1.
    */
    constructor(uint _ticketPrice, uint _ticketsPerPerson, uint _fee, uint _endingTime, uint _ticketAmount) public {
        require(_ticketPrice > 0, "Invalid ticket price");
        require(_endingTime > block.timestamp, "Invalid ending time");
        require(_ticketAmount > 0, "Invalid ticket amount");
        ticketPrice = _ticketPrice * 1 finney;
        ticketsPerPerson = _ticketsPerPerson;
        fee = _fee;
        endingTime = _endingTime;
        ticketAmount = _ticketAmount;
        state = State.Active;
    }

    /**
    * @dev Copy of constructor, used to reinitiate lottery
    */
    function _restartLottery(uint _ticketPrice, uint _ticketsPerPerson, uint _fee, uint _endingTime, uint _ticketAmount) public onlyOwner {
        require(state == State.Inactive, "Lottery is active");
        require(ticketsSold == 0 && uniqueOnwers == 0 && endingTime == 0, "Lottery must be cleaned");
        require(_ticketPrice > 0, "Invalid ticket price");
        require(_endingTime > block.timestamp, "Invalid ending time");
        require(_ticketAmount > 0, "Invalid ticket amount");
        ticketPrice = _ticketPrice * 1 finney;
        ticketsPerPerson = _ticketsPerPerson;
        fee = _fee;
        endingTime = _endingTime;
        ticketAmount = _ticketAmount;
        state = State.Active;
    }

    function() public payable {
        buyTicket();
    }

    function cleanLottery() public onlyOwner {
        require(_lotteryEnded(), "Lottery is ongoing.");
        for (uint i = 0; i < uniqueOnwers; i++) {
            delete ownerTicketCount[uniqueTicketOwners[i]];
        }
        for (uint j = 0; j < ticketsSold; j++) {
            delete ticketToOwner[j];
        }
        endingTime = 0;
        ticketsSold = 0;
        uniqueOnwers = 0;
        ticketsPerPerson = 0;
        state = State.Inactive;
    }

    function buyTicket() public payable {
        require(!_lotteryEnded(), "Lottery has finished.");
        require(ownerTicketCount[msg.sender] < ticketsPerPerson, "You already have the maximum amount of tickets.");
        require(msg.value == ticketPrice, "Incorrect sum paid");

        ticketsSold++;
        ticketToOwner[ticketsSold] = msg.sender;
        ownerTicketCount[msg.sender]++;
        if(ownerTicketCount[msg.sender] == 1) {
            uniqueTicketOwners.push(msg.sender);
            uniqueOnwers++;
        }

        emit TicketPurchased(msg.sender);
    } 

    /**
    * @dev Cancels the lottery by setting the ending time to the current time, then returns ticket sales
    */
    function cancelLottery() public onlyOwner {
        endingTime = block.timestamp;
        for(uint i = 0; i < uniqueOnwers; i++) {
            uniqueTicketOwners[i].transfer(ownerTicketCount[uniqueTicketOwners[i]] * ticketPrice);
        }
        cleanLottery();
        emit LotteryCanceled();
    }

    /**
    * @dev If ticketAmount is greater than 1, compare number to ticketsSold. 
    *      Check if timestamp >= endingTime either way. 
    *      If either condition is true, the lottery is ended.
    */
    function _lotteryEnded() private view returns (bool) {
        return (ticketAmount != 1) ? (ticketAmount == ticketsSold || block.timestamp >= endingTime) : block.timestamp >= endingTime;
    }

    /**
    * @dev Send lotteryWinner their reward
    */
    function finishLottery() public onlyOwner {
        require(_lotteryEnded(), "Lottery is still ongoing.");
        address lotteryWinner = ticketToOwner[_ticketSelect()];
        uint amountWon = ticketsSold.mul(ticketPrice);
        uint winningFee = amountWon.mul(fee).div(100);
        amountWon = amountWon.sub(winningFee);
        lotteryWinner.transfer(amountWon);
        owner.transfer(address(this).balance);
        cleanLottery();

        emit LotteryFinished(lotteryWinner, ticketsSold, amountWon);
    }

    /* @return a pseudorandom number based off of ending time, tickets sold, fees */
    function _ticketSelect() private view returns (uint) {
        require(_lotteryEnded(), "Lottery is still ongoing.");
        return uint(keccak256(abi.encodePacked(endingTime, block.timestamp, block.number))) % ticketsSold;
    }

    function withdrawBalance() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function lotteryEnded() public view returns(bool){
        return _lotteryEnded();
    }
}
