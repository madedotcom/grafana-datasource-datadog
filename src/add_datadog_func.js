import angular from 'angular';
import _ from 'lodash';
import $ from 'jquery';
import dfunc from './dfunc';

angular
  .module('grafana.directives')
  .directive('datadogAddFunc', function($compile) {
    var inputTemplate = '<input type="text"'+
                          ' class="gf-form-input"' +
                          ' spellcheck="false" style="display:none"></input>';

    var buttonTemplate = '<a  class="gf-form-label query-part dropdown-toggle"' +
                            ' tabindex="1" gf-dropdown="functionMenu" data-toggle="dropdown">' +
                            '<i class="fa fa-plus"></i></a>';

    return {
      link: function($scope, elem) {
        var categories = dfunc.getCategories();
        var allFunctions = getAllFunctionNames(categories);
        var ctrl = $scope.ctrl;

        $scope.functionMenu = createFunctionDropDownMenu(categories);

        var $input = $(inputTemplate);
        var $button = $(buttonTemplate);
        $input.appendTo(elem);
        $button.appendTo(elem);

        $input.attr('data-provide', 'typeahead');
        $input.typeahead({
          source: allFunctions,
          minLength: 1,
          items: 10,
          updater: function (value) {
            var funcDef = dfunc.getFuncDef(value);
            if (!funcDef) {
              // try find close match
              value = value.toLowerCase();
              funcDef = _.find(allFunctions, function(funcName) {
                return funcName.toLowerCase().indexOf(value) === 0;
              });

              if (!funcDef) { return; }
            }

            $scope.$apply(function() {
              ctrl.addFunction(funcDef);
            });

            $input.trigger('blur');
            return '';
          }
        });

        $button.click(function() {
          $button.hide();
          $input.show();
          $input.focus();
        });

        $input.keyup(function() {
          elem.toggleClass('open', $input.val() === '');
        });

        $input.blur(function() {
          // clicking the function dropdown menu wont
          // work if you remove class at once
          setTimeout(function() {
            $input.val('');
            $input.hide();
            $button.show();
            elem.removeClass('open');
          }, 200);
        });

        $compile(elem.contents())($scope);
      }
    };
  });

function getAllFunctionNames(categories) {
  return _.reduce(categories, function(list, category) {
    _.each(category, function(func) {
      list.push(func.name);
    });
    return list;
  }, []);
}

function createFunctionDropDownMenu(categories) {
  return _.map(categories, function(list, category) {
    return {
      text: category,
      submenu: _.map(list, function(value) {
        return {
          text: value.name,
          click: "ctrl.addFunction('" + value.name + "')",
        };
      })
    };
  });
}
