/**
 * Interface definition for BaseRepository.
 * Any storage implementation (InMemory, SQLite, PostgreSQL) must satisfy this contract.
 */
class BaseRepository {
  async findAll({ search, completed, sort } = {}) {
    throw new Error("Method not implemented: findAll");
  }

  async findById(id) {
    throw new Error("Method not implemented: findById");
  }

  async create({ title, completed = false }) {
    throw new Error("Method not implemented: create");
  }

  async update(id, updates) {
    throw new Error("Method not implemented: update");
  }

  async delete(id) {
    throw new Error("Method not implemented: delete");
  }
}

module.exports = BaseRepository;
