function isValidTitle(title) {
  if (title === undefined || typeof title !== "string" || title.trim() === "") {
    return false;
  }
  return true;
}

class Service {
  constructor(repo) {
    this.repo = repo;
  }

  async getAll({ search, completed, sort } = {}) {
    return this.repo.findAll({
      search,
      completed,
      sort,
    });
  }

  async getById(id) {
    if (isNaN(Number(id))) {
      return { error: "Invalid id", statusCode: 400 };
    }
    const item = await this.repo.findById(Number(id));
    if (!item) {
      return { error: `Task ${id} not found`, statusCode: 404 };
    }
    return { data: item };
  }

  async create({ title } = {}) {
    if (!isValidTitle(title)) {
      return {
        error: "Bad Request: empty or invalid title.",
        statusCode: 400,
      };
    }
    const created = await this.repo.create({
      title: title.trim(),
      completed: false,
    });
    return { data: created, statusCode: 201 };
  }

  async update(id, { title, completed } = {}) {
    if (isNaN(Number(id))) {
      return { error: "Invalid id", statusCode: 400 };
    }

    if (title === undefined && completed === undefined) {
      return {
        error: "Bad Request: Nothing to update!",
        statusCode: 400,
      };
    }

    const updates = {};
    if (title !== undefined) {
      if (!isValidTitle(title)) {
        return {
          error: "Bad Request: empty or invalid title.",
          statusCode: 400,
        };
      }
      updates.title = title.trim();
    }

    if (completed !== undefined) {
      updates.completed = [true, "true"].includes(completed);
    }

    const updated = await this.repo.update(Number(id), updates);
    if (!updated) {
      return {
        error: `Task ${id} not found`,
        statusCode: 404,
      };
    }

    return { data: updated };
  }

  async delete(id) {
    if (isNaN(Number(id))) {
      return { error: "Invalid id", statusCode: 400 };
    }

    const deleted = await this.repo.delete(Number(id));
    if (!deleted) {
      return {
        error: `Task ${id} not found`,
        statusCode: 404,
      };
    }
    return { success: true };
  }
}

module.exports = Service;
