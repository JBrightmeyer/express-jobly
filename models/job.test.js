"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 30,
    equity: 0.2,
    company_handle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job.title).toEqual("new");
    expect(typeof job.id).toEqual("number")

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${job.id}`);
    expect(job.title).toEqual("new");
    expect(typeof job.id).toEqual("number")
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([

      {
        title: "Title 1",
        id: 1,
        salary: 30,
        equity: "0.3",
        company_handle: "c1",
      },
      {
        title: "Title 2",
        id: 2,
        salary: 40,
        equity: "0.4",
        company_handle: "c2",
      },
      {
        title: "Title 3",
        id: 3,
        salary: 50,
        equity: "0",
        company_handle: "c3",
      },
    ]);
  });

  test("works: name filter", async function(){
    let filters = {"title":"Title 1"}
    let jobs = await Job.findAll(filters);
    expect(jobs).toEqual(
        [
            {
              title: "Title 1",
              id: 1,
              salary: 30,
              equity: "0.3",
              company_handle: "c1",
            }
          ]
    )
  })

  test("works: salary filter", async function(){
    let filters = {"minSalary":40}
    let jobs = await Job.findAll(filters);
    expect(jobs).toEqual(
        [
              {
                title: "Title 2",
                id: 2,
                salary: 40,
                equity: "0.4",
                company_handle: "c2",
              },
              {
                title: "Title 3",
                salary: 50,
                id: 3,
                equity: "0",
                company_handle: "c3",
              },
        ]
    )
  })
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
        title: "Title 1",
        id: 1,
        salary: 30,
        equity: "0.3",
        company_handle: "c1",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Job.get(40);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
        title: "Title 12"
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
        title: "Title 12",
        salary: 30,
        id: 1,
        equity: "0.3",
        company_handle: "c1",
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
        title: "Title 12",
        salary: 30,
        equity: "0.3",
        id: 1,
        company_handle: "c1",
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Job.update(40, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(40, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT title FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(40);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

