import { connectRefinementList } from 'instantsearch.js/es/connectors';
import { createRenderer } from '../../../helpers/test-renderer';
import { NgAisRefinementList } from '../refinement-list';
import { NgAisFacetsSearch } from '../facets-search';
import { NgAisHighlight } from '../../highlight/highlight';

const defaultState = {
  canRefine: true,
  canToggleShowMore: false,
  createURL: jest.fn(),
  isShowingMore: false,
  items: [
    { label: 'foo', count: 100, value: 'foo', isRefined: false },
    { label: 'bar', count: 100, value: 'bar', isRefined: false },
    { label: 'foobar', count: 100, value: 'foobar', isRefined: false },
    { label: 'barfoo', count: 100, value: 'barfoo', isRefined: false },
  ],
  refine: jest.fn(),
  toggleShowMore: jest.fn(),
};

const render = createRenderer({
  defaultState,
  template: '<ais-refinement-list></ais-refinement-list>',
  TestedWidget: NgAisRefinementList,
  additionalDeclarations: [NgAisHighlight, NgAisFacetsSearch],
});

describe('RefinementList', () => {
  it('renders markup without state', () => {
    const fixture = render();
    expect(fixture).toMatchSnapshot();
  });

  it('renders markup with state', () => {
    const fixture = render({});
    expect(fixture).toMatchSnapshot();
  });

  describe('connector init', () => {
    let render;
    let createWidget;
    beforeEach(() => {
      createWidget = jest.spyOn(NgAisRefinementList.prototype, 'createWidget');
      render = template =>
        createRenderer({
          defaultState,
          template,
          TestedWidget: NgAisRefinementList,
          additionalDeclarations: [NgAisHighlight, NgAisFacetsSearch],
        })({});
    });
    it('should be called with connectRefinementList', () => {
      render(`<ais-refinement-list></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][0]).toEqual(connectRefinementList);
    });
    it('should be called with attributeName undefined by default', () => {
      render(`<ais-refinement-list></ais-refinement-list>\``);
      expect(createWidget.mock.calls[0][1].attributeName).toBeUndefined();
    });
    it('should be called with attributeName passed down by attribute prop', () => {
      render(`<ais-refinement-list attribute="brands"></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].attributeName).toEqual('brands');
    });
    it('should be called with limit 10 by default', () => {
      render(`<ais-refinement-list></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].limit).toEqual(10);
    });
    it('should be called with limit passed down as prop', () => {
      render(`<ais-refinement-list [limit]="30"></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].limit).toEqual(30);
    });
    it('should be called with showMoreLimit undefined by default', () => {
      render(`<ais-refinement-list></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].showMoreLimit).toBeUndefined();
    });
    it('should be called with showMoreLimit passed down as prop', () => {
      render(
        `<ais-refinement-list [showMoreLimit]="30"></ais-refinement-list>`
      );
      expect(createWidget.mock.calls[0][1].showMoreLimit).toEqual(30);
    });
    it('should be called with operator "or" by default', () => {
      render(`<ais-refinement-list></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].operator).toEqual('or');
    });
    it('should be called with operator passed down as prop', () => {
      render(`<ais-refinement-list operator="and"></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].operator).toEqual('and');
    });
    it('should be called with sortBy undefined by default', () => {
      render(`<ais-refinement-list></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].sortBy).toBeUndefined();
    });
    it('should be called with sortBy passed down as prop', () => {
      render(`<ais-refinement-list sortBy="name"></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].sortBy).toEqual('name');
    });
    it('should be called with escapeFacetValues true by default', () => {
      render(`<ais-refinement-list></ais-refinement-list>`);
      expect(createWidget.mock.calls[0][1].escapeFacetValues).toEqual(true);
    });
    afterEach(() => {
      createWidget.mockRestore();
    });
  });

  it('should call `toggleShowMore()` on click', () => {
    const toggleShowMore = jest.fn();
    const fixture = render({ toggleShowMore, canToggleShowMore: true });
    fixture.componentInstance.testedWidget.limit = 5;
    fixture.componentInstance.testedWidget.showMoreLimit = 10;
    fixture.detectChanges();

    const showMoreBtn = fixture.debugElement.nativeElement.querySelector(
      'button'
    );
    showMoreBtn.click();

    expect(toggleShowMore).toHaveBeenCalled();
  });

  it('should call `refine()` on item click', () => {
    const refine = jest.fn();
    const fixture = render({ refine });

    const [, secondItem] = fixture.debugElement.nativeElement.querySelectorAll(
      'li'
    );
    secondItem.click();

    expect(refine).toHaveBeenCalled();
    expect(refine).toHaveBeenCalledWith(defaultState.items[1].value);
  });

  it('should apply `transformItems` if specified', () => {
    const fixture = render({});
    fixture.componentInstance.testedWidget.transformItems = items =>
      items.map(item => ({ ...item, label: `transformed - ${item.label}` }));
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should call `searchForItems` when searching', () => {
    const searchForItems = jest.fn();
    const fixture = render({ searchForItems });

    // display search box
    fixture.componentInstance.testedWidget.searchable = true;
    fixture.detectChanges();

    const input = fixture.debugElement.nativeElement.querySelector('input');
    input.value = 'foobar';
    input.dispatchEvent(new Event('input'));

    expect(searchForItems).toHaveBeenCalled();
    expect(searchForItems).toHaveBeenCalledWith('foobar');
  });

  it('should be hidden with autoHideContainer', () => {
    const fixture = render({ items: [] });
    fixture.componentInstance.testedWidget.autoHideContainer = true;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
