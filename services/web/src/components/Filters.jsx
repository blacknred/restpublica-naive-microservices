/* eslint-disable no-undef */
import React from 'react';

import { Toolbar } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

const styles = {
    toolbar: {
        width: '100%', zIndex: '2', background: 'rgb(238, 238, 238)',
        position: 'fixed', justifyContent: 'center', left: '0px',
        transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
    }
}

const Filters = ({ drawer, filters, handleFiltersChange, sort_val, filter_val}) => {

    return (
        <Toolbar style={Object.assign({}, styles.toolbar,
            { paddingLeft: drawer ? '235px' : '0px' },
            { top: filters ? '56px' : '0px' })}>
            <DropDownMenu
                value={sort_val}
                onChange={(value) => { handleFiltersChange(++value) }} >
                <MenuItem value={1} primaryText="By date" />
                <MenuItem value={2} primaryText="Most liked" />
                <MenuItem value={3} primaryText="Most commented" />
            </DropDownMenu>
            <DropDownMenu
                value={filter_val}
                onChange={(value) => { handleFiltersChange(++value) }} >
                <MenuItem value={1} primaryText="Any type" />
                <MenuItem value={2} primaryText="Text" />
                <MenuItem value={3} primaryText="Pictures" />
                <MenuItem value={4} primaryText="Gifs" />
                <MenuItem value={5} primaryText="Videos" />
                <MenuItem value={6} primaryText="Music" />
            </DropDownMenu>
            <DropDownMenu
                value={sort_val}
                onChange={(value) => { handleFiltersChange(++value) }} >
                <MenuItem value={1} primaryText="By date" />
                <MenuItem value={2} primaryText="Most liked" />
                <MenuItem value={3} primaryText="Most commented" />
            </DropDownMenu>
            <DropDownMenu
                value={filter_val}
                onChange={(value) => { handleFiltersChange(++value) }} >
                <MenuItem value={1} primaryText="Any type" />
                <MenuItem value={2} primaryText="Text" />
                <MenuItem value={3} primaryText="Pictures" />
                <MenuItem value={4} primaryText="Gifs" />
                <MenuItem value={5} primaryText="Videos" />
                <MenuItem value={6} primaryText="Music" />
            </DropDownMenu>
        </Toolbar>
    )
}

export default Filters
