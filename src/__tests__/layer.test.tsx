import * as React from 'react';
import Layer from '../layer';
import { withContext } from 'recompose';
import { mount } from 'enzyme';
const PropTypes = require('prop-types'); // tslint:disable-line

describe('Layer', () => {
  let LayerWithContext: any;
  let addLayerMock = jest.fn();
  let addSourceMock = jest.fn();
  let addImageMock = jest.fn();
  let setDataMock = jest.fn();
  let children: any[];
  let childrenWithOneFeature: any[];
  let feature: any;

  beforeEach(() => {
    addLayerMock = jest.fn();
    addSourceMock = jest.fn();
    setDataMock = jest.fn();
    addImageMock = jest.fn();
    feature = { coordinates: [-123, 45] };
    children = [{ props: {} }];
    childrenWithOneFeature = [{ props: feature }];

    LayerWithContext = withContext(
      {
        map: PropTypes.object
      },
      () => ({
        map: {
          addSource: addSourceMock,
          addLayer: addLayerMock,
          addImage: addImageMock,
          on: jest.fn(),
          getSource: jest.fn().mockReturnValue({ setData: setDataMock })
        }
      })
    )(Layer);
  });

  it('Should render layer with default options', () => {
    mount(<LayerWithContext children={children} />);

    expect(addLayerMock.mock.calls[0]).toEqual([
      {
        id: undefined,
        source: undefined,
        type: 'symbol',
        layout: {},
        paint: {}
      },
      undefined
    ]);
  });

  it('Should set all parameters of add layer', () => {
    const before = 'test1';
    const props = {
      id: '123',
      type: 'symbol',
      paint: {},
      layout: {},
      metadata: {},
      interactive: true,
      filter: []
    };

    const mappedProps = {
      minZoom: 2,
      maxZoom: 10,
      sourceLayer: 'sourceTest',
      sourceId: 'test',
      layerRef: 'testRef'
    };

    mount(<LayerWithContext children={children} {...props} {...mappedProps} before={before}/>);
    expect(addLayerMock.mock.calls[0]).toEqual([
      {
        ...props,
        minzoom: 2,
        maxzoom: 10,
        source: 'test',
        ref: 'testRef',
        'source-layer': 'sourceTest'
      },
      before
    ]);
  });

  it('Should render layer with default source', () => {
    mount(<LayerWithContext children={children} />);

    expect(addSourceMock.mock.calls[0]).toEqual([
      undefined,
      {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      }
    ]);
  });

  it('Should set all parameters of add source with geojsonSourceOptions', () => {
    const geoJSONSourceOptions = {
      maxzoom: 10,
      buffer: 2,
      tolerance: 1,
      cluster: 10,
      clusterRadius: 50,
      clusterMaxZoom: 10
    };
    const layerSourceId = 'testId';
    mount(<LayerWithContext children={children} id={layerSourceId} geoJSONSourceOptions={geoJSONSourceOptions} />);

    expect(addSourceMock.mock.calls[0]).toEqual([
      layerSourceId,
      {
        type: 'geojson',
        ...geoJSONSourceOptions,
        data: {
          type: 'FeatureCollection',
          features: []
        }
      }
    ]);
  });

  it('Should set features based on children', () => {
    const layer = mount(<LayerWithContext children={childrenWithOneFeature} />);

    expect(setDataMock.mock.calls[0]).toEqual([
      {
        type: 'FeatureCollection',
        features: [
          {
            geometry: { ...feature, type: 'Point' },
            properties: { id: 0 },
            type: 'Feature'
          }
        ]
      }
    ]);
  });

  it('Should set features to empty array when children disappear', () => {
    const layer = mount(<LayerWithContext children={childrenWithOneFeature} />);

    layer.setProps({ children: undefined });

    expect(setDataMock.mock.calls[1]).toEqual([
      {
        type: 'FeatureCollection',
        features: []
      }
    ]);
  });

  it('Should flatten features', () => {
    const childrens = [<div>Test</div>, [<div>Test</div>, <div>Test</div>]];

    const layer = mount(<LayerWithContext children={childrens} />);

    expect(setDataMock.mock.calls[0][0].features).toHaveLength(3);
  });

  it('Should add images', () => {
    const images = ['test', new Image(), {}];

    mount(<LayerWithContext children={children} images={images} />);

    expect(addImageMock.mock.calls[0]).toEqual(images);
  });
});
