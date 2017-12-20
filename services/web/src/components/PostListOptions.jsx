import React from 'react';

import { Toolbar } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

import ContentFilterListIcon from 'material-ui/svg-icons/content/filter-list';

const styles = {
    toolbar: {
        width: '100%', zIndex: '2', background: 'rgb(238, 238, 238)',
        position: 'fixed', justifyContent: 'center', left: '0px',
        transition: 'all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        alignItems: 'center'
    },
    filtersGroup: {
        display: 'flex', flexDirection: 'row', marginRight: '3em'
    },
    filter: {
        width: 'auto', marginLeft: '1.5em'
    }
}

const PostListOptions = ({ drawer, isOptionsOpen, handleFilterChange, filter,
    layout, handleLayoutChange, runEffect, handleRunEffectChange }) => {
    return (
        <Toolbar style={Object.assign({}, styles.toolbar,
            { paddingLeft: drawer ? '235px' : '0px' },
            { top: isOptionsOpen ? '56px' : '0px' })}>
            <ContentFilterListIcon />
            <RadioButtonGroup
                style={styles.filtersGroup}
                name="filter"
                defaultSelected={filter}
                onChange={(e, val) => handleFilterChange(val)} >
                <RadioButton
                    style={styles.filter}
                    value="none"
                    label="All"
                />
                <RadioButton
                    style={styles.filter}
                    value="trending"
                    label="Trending"
                />
                <RadioButton
                    style={styles.filter}
                    value="text"
                    label="Text"
                />
                <RadioButton
                    style={styles.filter}
                    value="image"
                    label="Images"
                />
                <RadioButton
                    style={styles.filter}
                    value="gif"
                    label="Gifs"
                />
                <RadioButton
                    style={styles.filter}
                    value="video"
                    label="Videos"
                />
                <RadioButton
                    style={styles.filter}
                    value="music"
                    label="Music"
                />
            </RadioButtonGroup>

            <DropDownMenu
                value={layout}
                onChange={(value) => { handleLayoutChange(value) }} >
                <MenuItem value={1} primaryText="Grid A" />
                <MenuItem value={2} primaryText="Grid B" />
                <MenuItem value={3} primaryText="Grid C" />
            </DropDownMenu>
            <DropDownMenu
                value={runEffect}
                onChange={(value) => { handleRunEffectChange(value) }} >
                <MenuItem value={1} primaryText="Hapi" />
                <MenuItem value={2} primaryText="Amun" />
                <MenuItem value={3} primaryText="Kek" />
                <MenuItem value={4} primaryText="Isis" />
                <MenuItem value={5} primaryText="Montu" />
                <MenuItem value={6} primaryText="Osiris" />
            </DropDownMenu>
        </Toolbar>
    )
}

export default PostListOptions;
