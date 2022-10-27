import {
  StreamRead,
  StreamReadRequestBody,
  StreamsListRead,
  StreamsListRequestBody,
} from "core/request/ConnectorBuilderClient";

import { AirbyteRequestService } from "../../request/AirbyteRequestService";

function mockRecord(streamName: string, recordNum: number) {
  return {
    id: `record_${recordNum}`,
    object: streamName,
    amount: recordNum * 1000,
  };
}

function mockPage(streamName: string, pageNum: number, numRecords: number) {
  const records = Array.from(Array(numRecords).keys()).map((i) => mockRecord(streamName, i));

  return {
    records,
    request: {
      url: `https://api.com/${streamName}?page=${pageNum}`,
      parameters: {
        page: pageNum,
      },
    },
    response: {
      status: 200,
      body: {
        data: records,
      },
    },
  };
}

function mockSlice(streamName: string, day: number, numPages: number, numRecords: number) {
  const pages = Array.from(Array(numPages).keys()).map((i) => mockPage(streamName, i, numRecords));

  return {
    sliceDescriptor: { startDatetime: `${day} Jan 2022`, listItem: "airbyte-cloud" },
    state: {
      type: "STREAM",
      stream: { stream_descriptor: { name: streamName }, stream_state: { date: `2022-01-0${day}` } },
      data: { [streamName]: { date: `2022-01-0${day}` } },
    },
    pages,
  };
}

export class ConnectorBuilderRequestService extends AirbyteRequestService {
  public readStream(readParams: StreamReadRequestBody): Promise<StreamRead> {
    // TODO: uncomment this and remove mock responses once there is a real API to call
    // return readStream(readParams, this.requestOptions);
    console.log("------------");
    console.log(`Stream: ${readParams.stream}`);
    console.log(`Connector manifest:\n${JSON.stringify(readParams.manifest)}`);
    console.log(`Config:\n${JSON.stringify(readParams.config)}`);
    return new Promise((resolve) => setTimeout(resolve, 200)).then(() => {
      const slices = Array.from(Array(9).keys()).map((i) => mockSlice(readParams.stream, i, 10, 20));

      return {
        logs: [
          { level: "INFO", message: `Syncing stream: ${readParams.stream}` },
          { level: "INFO", message: `Setting state of ${readParams.stream} to {'date': '2022-09-25'}` },
        ],
        slices,
      };
    });
  }

  public listStreams(listParams: StreamsListRequestBody): Promise<StreamsListRead> {
    // TODO: uncomment this and remove mock responses once there is a real API to call
    // return listStreams(listParams, this.requestOptions);
    console.log(`Received listStreams body: ${JSON.stringify(listParams)}`);
    return new Promise((resolve) => setTimeout(resolve, 200)).then(() => {
      return {
        streams: [
          {
            name: "disputes",
            url: "https://api.com/disputes",
          },
          {
            name: "transactions",
            url: "https://api.com/transactions",
          },
          {
            name: "users",
            url: "https://api.com/users",
          },
        ],
      };
    });
  }
}
