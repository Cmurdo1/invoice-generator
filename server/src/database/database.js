import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file paths
const DB_DIR = join(__dirname, '../../../data');
const USERS_DB = join(DB_DIR, 'users.json');
const INVOICES_DB = join(DB_DIR, 'invoices.json');
const CLIENTS_DB = join(DB_DIR, 'clients.json');
const SUBSCRIPTIONS_DB = join(DB_DIR, 'subscriptions.json');
const PRODUCTS_DB = join(DB_DIR, 'products.json');

// Ensure database directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database files with empty arrays if they don't exist
const initializeFile = (filePath, defaultData = []) => {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Initialize all database files
initializeFile(USERS_DB);
initializeFile(INVOICES_DB);
initializeFile(CLIENTS_DB);
initializeFile(SUBSCRIPTIONS_DB);
initializeFile(PRODUCTS_DB, [
  {
    id: '1',
    name: 'Web Development',
    description: 'Custom web development services',
    price: 100,
    category: 'Development',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Design Consultation',
    description: 'UI/UX design consultation services',
    price: 75,
    category: 'Design',
    created_at: new Date().toISOString()
  }
]);

// Generic database operations
class JSONDatabase {
  constructor(filePath) {
    this.filePath = filePath;
  }

  read() {
    try {
      const data = readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.filePath}:`, error);
      return [];
    }
  }

  write(data) {
    try {
      writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${this.filePath}:`, error);
      return false;
    }
  }

  findAll() {
    return this.read();
  }

  findById(id) {
    const data = this.read();
    return data.find(item => item.id === id);
  }

  findBy(criteria) {
    const data = this.read();
    return data.filter(item => {
      return Object.keys(criteria).every(key => {
        if (typeof criteria[key] === 'string' && typeof item[key] === 'string') {
          return item[key].toLowerCase().includes(criteria[key].toLowerCase());
        }
        return item[key] === criteria[key];
      });
    });
  }

  findOne(criteria) {
    const results = this.findBy(criteria);
    return results.length > 0 ? results[0] : null;
  }

  create(data) {
    const allData = this.read();
    const newItem = {
      id: data.id || uuidv4(),
      ...data,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    allData.push(newItem);
    
    if (this.write(allData)) {
      return newItem;
    }
    return null;
  }

  update(id, updateData) {
    const allData = this.read();
    const index = allData.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }

    allData[index] = {
      ...allData[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    if (this.write(allData)) {
      return allData[index];
    }
    return null;
  }

  delete(id) {
    const allData = this.read();
    const filteredData = allData.filter(item => item.id !== id);
    
    if (filteredData.length < allData.length) {
      return this.write(filteredData);
    }
    return false;
  }

  count(criteria = {}) {
    if (Object.keys(criteria).length === 0) {
      return this.read().length;
    }
    return this.findBy(criteria).length;
  }
}

// Database instance
export const createDatabase = () => {
  return {
    users: new JSONDatabase(USERS_DB),
    invoices: new JSONDatabase(INVOICES_DB),
    clients: new JSONDatabase(CLIENTS_DB),
    subscriptions: new JSONDatabase(SUBSCRIPTIONS_DB),
    products: new JSONDatabase(PRODUCTS_DB)
  };
};

export default createDatabase;
