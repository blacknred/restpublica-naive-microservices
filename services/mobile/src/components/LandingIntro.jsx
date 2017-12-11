import React from 'react';
import { Link } from 'react-router-dom'

import FlatButton from 'material-ui/FlatButton';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';

const FormIntro = (props) => {
    return (
        <div>
            <FlatButton
                label={<Link to='/popular'>Explore</Link>}
                icon={<ActionExploreIcon />}
                fullWidth={true} />
        </div>
    )
}

export default FormIntro;
