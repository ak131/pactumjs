const {spec, request} = require("pactum");
const { expect } = require("chai")


describe("Testing Restful Booker", () => {
    request.setBaseUrl("https://restful-booker.herokuapp.com");
    
    it("Check Health", async () => {
        const api = "/ping";
        await spec().get(api).expectStatus(201);
        console.log("API Health OK!");
    });

    it("Create Token", async () => {
        const api = "/auth";
        const creds = {
            "username": "admin",
            "password": "password123"
        }
        const result = await spec().post(api).withHeaders("Content-Type", "application/json").withHeaders("Accept", "application/json").withJson(creds)
            .expectJsonLike({"token": /.+/}).stores("token", "res.body.token").returns("res.body").expectStatus(200);
        console.log("Authentication Token: " + result.token);
    });

    it("Test get bookings", async () => {
        const api = "/booking";
        const body = await spec().get(api).expectStatus(200).returns("res.body");
        expect(body.length).to.not.equal(0);
        console.log("Total Records: " + body.length);
    });

    it("Test get bookings with name filter", async () => {
        const api = "/booking";
        const body = await spec().get(api).withQueryParams("firstname","John").expectStatus(200).returns("res.body");
        expect(body.length).to.not.equal(0);
        console.log("Total Records (with firstname John): " + body.length);
    });

    it("Test get bookings with checkin date filter", async () => {
        const api = "/booking";
        const body = await spec().get(api).withQueryParams("checkin","2022-06-28").expectStatus(200).returns("res.body");
        expect(body.length).to.not.equal(0);
        console.log("Total Records with (checkin date higher or eqaul to 2022-06-28): " + body.length);
    });

    it("Test get booking with id", async () => {
        const api = "/booking/{booking_id}"
        const result = await spec().get(api).withHeaders("Accept", "application/json").withPathParams("booking_id", 1030).expectStatus(200).expectJson({
            firstname: 'Lilja',
            lastname: 'Seppala',
            totalprice: 917,
            depositpaid: false,
            bookingdates: { checkin: '2022-06-28', checkout: '2022-07-08' },
            additionalneeds: 'Dinner'
          }).returns("res.body");
        console.log("Booking detail with id: " + 1030);
        console.log(result);
    });

    it("Test create booking", async () => {
        const api = "/booking"
        const data = {
            "firstname" : "Test",
            "lastname" : "User",
            "totalprice" : 500,
            "depositpaid" : true,
            "bookingdates" : {
                "checkin" : "2022-07-01",
                "checkout" : "2022-07-30"
            },
            "additionalneeds" : "Nothing"
        }
        const result = await spec().post(api).withHeaders("Content-Type", "application/json").withHeaders("Accept", "application/json").withJson(data)
            .expectStatus(200).expectJsonLike({"booking": data}).stores("booking_id", "res.body.bookingid").returns("res.body");
        console.log("Created following record with " + result.bookingid);
        console.log(result);
    });

    it("Test update booking", async () => {
        const api = "/booking/{booking_id}"
        const data = {
            "firstname" : "Tester",
            "lastname" : "User",
            "totalprice" : 1000,
            "depositpaid" : false,
            "bookingdates" : {
                "checkin" : "2022-07-01",
                "checkout" : "2022-07-30"
            },
            "additionalneeds" : "Something"
        }
        const result = await spec().put(api).withHeaders("Content-Type", "application/json").withHeaders("Accept", "application/json")
            .withHeaders("Cookie", "token=$S{token}").withPathParams("booking_id","$S{booking_id}").withJson(data)
            .expectStatus(200).expectJson(data).returns("res.body");
        console.log(result);
    });

    it("Test update partial booking", async () => {
        const api = "/booking/{booking_id}"
        const data = {
            "firstname": "Auto",
            "lastname": "Tester",
            "depositpaid": true
        }
        const result = await spec().patch(api).withHeaders("Content-Type", "application/json").withHeaders("Accept", "application/json")
            .withHeaders("Cookie", "token=$S{token}").withPathParams("booking_id", "$S{booking_id}").withJson(data)
            .expectStatus(200).expectJsonLike(data).returns("res.body");
        console.log(result);
    });

    it("Test delete booking", async () => {
        const api = "/booking/{booking_id}"
        await spec().delete(api).withHeaders("Cookie", "token=$S{token}").withPathParams("booking_id", "$S{booking_id}").expectStatus(201);
    });
});
