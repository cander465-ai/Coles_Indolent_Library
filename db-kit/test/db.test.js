'use strict'
const { connect, withDefaults, createRepository } = require('../index')

// A fake model, so no real database is needed
function makeFakeModel() {
    const items = {}
    let nextId = 1
    return {
        create: async (data) => { const doc = { id: nextId++, ...data }; items[doc.id] = doc; return doc },
        find: async () => Object.values(items),
        findById: async (id) => items[id] || null,
        findByIdAndUpdate: async (id, data) => (items[id] ? Object.assign(items[id], data) : null),
        findByIdAndDelete: async (id) => { const doc = items[id] || null; delete items[id]; return doc },
    }
}

const codeOf = (fn) => { try { fn() } catch (err) { return err.code } }

test('create then findById returns the document', async () => {
    const repo = createRepository(makeFakeModel())
    const doc = await repo.create({ name: 'Cole' })
    expect((await repo.findById(doc.id)).name).toBe('Cole')
})

test('find returns all documents', async () => {
    const repo = createRepository(makeFakeModel())
    await repo.create({ name: 'A' })
    await repo.create({ name: 'B' })
    expect((await repo.find()).length).toBe(2)
})

test('update changes the document', async () => {
    const repo = createRepository(makeFakeModel())
    const doc = await repo.create({ name: 'Old' })
    expect((await repo.update(doc.id, { name: 'New' })).name).toBe('New')
})

test('withDefaults adds createdAt', () => {
    const schema = withDefaults({ name: String })
    expect(Boolean(schema.path('createdAt'))).toBe(true)
})

test('failure: findById on a missing id throws NOT_FOUND', async () => {
    const repo = createRepository(makeFakeModel())
    await expect(repo.findById(999)).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('failure: remove then findById throws NOT_FOUND', async () => {
    const repo = createRepository(makeFakeModel())
    const doc = await repo.create({ name: 'Gone' })
    await repo.remove(doc.id)
    await expect(repo.findById(doc.id)).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('failure: createRepository rejects something that is not a model', () => {
    expect(codeOf(() => createRepository({}))).toBe('INVALID_MODEL')
})

test('failure: connect rejects an empty uri', async () => {
    await expect(connect('')).rejects.toMatchObject({ code: 'INVALID_URI' })
})

test('contract: exports and repository methods', () => {
    expect(Object.keys(require('../index')).sort()).toEqual(['connect', 'createRepository', 'withDefaults'])
    expect(Object.keys(createRepository(makeFakeModel())).sort())
        .toEqual(['create', 'find', 'findById', 'remove', 'update'])
})