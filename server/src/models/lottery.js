const db = require('../../config/db-simple');

class Lottery {
  constructor() {
    this.lotteryData = {
      id: 1,
      name: 'Томбола на Шефа',
      description: 'Участвайте в томболата и спечелете книга от Шефа!',
      prize: 'Книга с рецепти от Шефа',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
      participants: [],
      winner: null,
      maxParticipants: 100
    };
    this.init();
  }

  init() {
    // Initialize lottery data if it doesn't exist
    if (db.lottery.size === 0) {
      db.lottery.set('1', this.lotteryData);
      db.saveLottery();
    }
  }

  getLottery() {
    // Get the first (and only) lottery entry
    const lotteryEntries = Array.from(db.lottery.values());
    return lotteryEntries[0] || this.lotteryData;
  }

  addParticipant(userId, username) {
    const lottery = this.getLottery();

    // Check if lottery is active
    if (!lottery.isActive) {
      throw new Error('Томболата не е активна');
    }

    // Check if user is already participating
    if (lottery.participants.some(p => p.userId === userId)) {
      throw new Error('Вече участвате в томболата');
    }

    // Check if lottery is full
    if (lottery.participants.length >= lottery.maxParticipants) {
      throw new Error('Томболата е пълна');
    }

    // Check if lottery has ended
    if (new Date() > new Date(lottery.endDate)) {
      throw new Error('Томболата е приключила');
    }

    const participant = {
      userId,
      username,
      joinDate: new Date()
    };

    lottery.participants.push(participant);

    // Update the lottery in the database
    db.lottery.set('1', lottery);
    db.saveLottery();

    return lottery;
  }

  drawWinner() {
    const lottery = this.getLottery();

    if (!lottery.isActive) {
      throw new Error('Томболата не е активна');
    }

    if (new Date() <= new Date(lottery.endDate)) {
      throw new Error('Томболата все още не е приключила');
    }

    if (lottery.participants.length === 0) {
      throw new Error('Няма участници в томболата');
    }

    if (lottery.winner) {
      throw new Error('Победителят вече е избран');
    }

    // Randomly select winner
    const randomIndex = Math.floor(Math.random() * lottery.participants.length);
    lottery.winner = lottery.participants[randomIndex];
    lottery.isActive = false;

    // Update the lottery in the database
    db.lottery.set('1', lottery);
    db.saveLottery();

    return lottery;
  }

  resetLottery() {
    const newLottery = {
      ...this.lotteryData,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      participants: [],
      winner: null
    };

    // Update the lottery in the database
    db.lottery.set('1', newLottery);
    db.saveLottery();

    return newLottery;
  }

  updateLottery(updates) {
    const lottery = this.getLottery();
    const updatedLottery = { ...lottery, ...updates };

    // Update the lottery in the database
    db.lottery.set('1', updatedLottery);
    db.saveLottery();

    return updatedLottery;
  }
}

module.exports = new Lottery();
