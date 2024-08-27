import type { SuccessResult } from "open-graph-scraper-lite";

export type OgObject = SuccessResult["result"];

export type ParseResult =
  | ParseResultSuccess
  | ParseResultError
  | ParseResultNotApplicable;

export type ParseResultSuccess = {
  status: "success";
  ogdata: OgObject;
};

export type ParseResultError = {
  status: "error";
  ogdata?: OgObject;
};

export type ParseResultNotApplicable = {
  status: "not-applicable";
};

