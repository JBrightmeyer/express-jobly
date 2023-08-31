"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 30,
    equity: 0.2,
    company_handle: "c1"
  };

  test("ok for users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body.job.title).toEqual("new");
    expect(typeof resp.body.job.id).toEqual("number")
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "new",
            salary: "not a salary",
            equity: 0.2,
            company_handle: "c1"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body.jobs.length).toEqual(3);
    expect(typeof resp.body.jobs[0].id).toEqual("number")
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const jobsRes = await request(app).get("/jobs")
    const id = jobsRes.body.jobs[0].id
    const resp = await request(app).get(`/jobs/${id}`);
    expect(resp.body).toEqual({"job": {
        "company_handle": "c1",
        "equity": "0.3",
        "id": id,
        "salary": 30,
        "title": "t1"}});
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for users", async function () {
    const jobsRes = await request(app).get("/jobs")
    const id = jobsRes.body.jobs[0].id
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: "t1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({"job": {
        "company_handle": "c1",
        "equity": "0.3",
        "id": id,
        "salary": 30,
        "title": "t1-new"}}
    );
  });

  test("unauth for anon", async function () {
    const jobsRes = await request(app).get("/jobs")
    const id = jobsRes.body.jobs[0].id
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: "t1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/40`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const jobsRes = await request(app).get("/jobs")
    const id = jobsRes.body.jobs[0].id
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          id: 5,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const jobsRes = await request(app).get("/jobs")
    const id = jobsRes.body.jobs[0].id
    const resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          salary: "not-a-url",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for users", async function () {
    const jobsRes = await request(app).get("/jobs")
    const id = jobsRes.body.jobs[0].id
    const resp = await request(app)
        .delete(`/jobs/${id}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: `${id}` });
  });

  test("unauth for anon", async function () {
    const jobsRes = await request(app).get("/jobs")
    const id = jobsRes.body.jobs[0].id
    const resp = await request(app)
        .delete(`/jobs/${id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const jobsRes = await request(app).get("/jobs")
    const id = jobsRes.body.jobs[0].id
    const resp = await request(app)
        .delete(`//jobs/40`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
