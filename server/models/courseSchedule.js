const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../config/data/courseSchedules.json');

// Ensure the data file exists
if (!fs.existsSync(dataPath)) {
    const initialData = [];
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
}

class CourseScheduleModel {
    constructor() {
        this.dataPath = dataPath;
    }

    // Read all course schedules
    getAll() {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading course schedules:', error);
            return [];
        }
    }

    // Get course schedule by ID
    getById(id) {
        try {
            const schedules = this.getAll();
            return schedules.find(schedule => schedule._id === id);
        } catch (error) {
            console.error('Error getting course schedule by ID:', error);
            return null;
        }
    }

    // Create new course schedule
    create(scheduleData) {
        try {
            const schedules = this.getAll();
            const newSchedule = {
                _id: this.generateId(),
                ...scheduleData,
                created_at: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _v: 0
            };

            schedules.push(newSchedule);
            this.saveData(schedules);
            return newSchedule;
        } catch (error) {
            console.error('Error creating course schedule:', error);
            throw error;
        }
    }

    // Update course schedule
    update(id, updateData) {
        try {
            const schedules = this.getAll();
            const index = schedules.findIndex(schedule => schedule._id === id);

            if (index === -1) {
                throw new Error('Course schedule not found');
            }

            schedules[index] = {
                ...schedules[index],
                ...updateData,
                updatedAt: new Date().toISOString(),
                _v: (schedules[index]._v || 0) + 1
            };

            this.saveData(schedules);
            return schedules[index];
        } catch (error) {
            console.error('Error updating course schedule:', error);
            throw error;
        }
    }

    // Update course schedule status
    updateStatus(id, status) {
        try {
            const schedules = this.getAll();
            const index = schedules.findIndex(schedule => schedule._id === id);

            if (index === -1) {
                throw new Error('Course schedule not found');
            }

            schedules[index].status = status;
            schedules[index].updatedAt = new Date().toISOString();
            schedules[index]._v = (schedules[index]._v || 0) + 1;

            this.saveData(schedules);
            return schedules[index];
        } catch (error) {
            console.error('Error updating course schedule status:', error);
            throw error;
        }
    }

    // Delete course schedule
    delete(id) {
        try {
            const schedules = this.getAll();
            const filteredSchedules = schedules.filter(schedule => schedule._id !== id);

            if (filteredSchedules.length === schedules.length) {
                throw new Error('Course schedule not found');
            }

            this.saveData(filteredSchedules);
            return true;
        } catch (error) {
            console.error('Error deleting course schedule:', error);
            throw error;
        }
    }

    // Get course schedules by instructor
    getByInstructor(instructorId) {
        try {
            const schedules = this.getAll();
            return schedules.filter(schedule => schedule.instructorId === instructorId);
        } catch (error) {
            console.error('Error getting course schedules by instructor:', error);
            return [];
        }
    }

    // Get published course schedules
    getPublished() {
        try {
            const schedules = this.getAll();
            return schedules.filter(schedule => schedule.status === 'published');
        } catch (error) {
            console.error('Error getting published course schedules:', error);
            return [];
        }
    }

    // Save data to file
    saveData(data) {
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving course schedules data:', error);
            throw error;
        }
    }

    // Generate unique ID
    generateId() {
        return 'cs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

module.exports = new CourseScheduleModel();
