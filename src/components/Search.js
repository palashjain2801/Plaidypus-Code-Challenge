import React from 'react';
import '../Search.css';
import axios from 'axios';
import Loader from '../loader.gif';

class Search extends React.Component {

	constructor( props ) {
		super( props );

		this.state = {
			query: '',
			results: {},
			loading: false,
			message: '',
			totalResults: 0,
			totalPages: 0,
			currentPageNo: 0,
		};

		this.cancel = '';
	}


	
	getPageCount = ( total, denominator ) => {
		const divisible	= 0 === total % denominator;
		const valueToBeAdded = divisible ? 0 : 1;
		return Math.floor( total/denominator ) + valueToBeAdded;
	};

	/**
	 * Fetch the search results and update the state with the result.
	 * Also cancels the previous query before making the new one.
	 *
	 * @param {int} updatedPageNo Updated Page No.
	 * @param {String} query Search Query.
	 *
	 */
	fetchSearchResults = ( updatedPageNo = '', query ) => {
		this.setState( { loading: true });
		const api_key = 'IE10yHBjuQA30knF3eVUo9qB6AfiYlpymP6Ti6EVFx1P_c2JMSuWa8_6HC9ALVUk2PVwlw5w28ITj4rHsKigrQ_5rXS6eYqdCD0bsw8bHqYQMc8YzhLxS9cQuzGiX3Yx';
		const search = `${'https://cors-anywhere.herokuapp.com/'}https://api.yelp.com/v3/businesses/search`;

		if( this.cancel ) {
			this.cancel.cancel();
		}

		this.cancel = axios.CancelToken.source();

		axios.get( search, {
			headers : {
				Authorization: `Bearer ${api_key}`,
			},
			params: {
				location: query,
		   }
		} )
			.then( res => {
				const total = res.data.total;
				const totalPageCount = this.getPageCount( total, 20 );
				const resultNotFoundMsg = ! res.data.length === 0 ? 'There are no more search results. Please try a new search' : '';

				setTimeout(function() {
					this.setState( {
						loading : false , 
						results : res.data.businesses,
						message : resultNotFoundMsg,
						totalResults : total,
						totalPages : totalPageCount,
						currentPageNo : updatedPageNo
					} );
				}.bind(this), 1000);
			} )
			.catch( error => {
				if ( axios.isCancel(error) || error ) {
					this.setState({
						loading: false,
						message: 'Failed to fetch the data. Please check network'
					})
				}
			} )
	};

	handleOnInputChange = () => {
		if ( this.state.query.length !== 0) {
			this.fetchSearchResults( 1, this.state.query );
		}
	};

	/**
	 * Fetch results according to the prev or next page requests.
	 *
	 * @param {String} type 'prev' or 'next'
	 */

	renderSearchResults = () => {
		const { results } = this.state;

		if ( Object.keys( results ).length && results.length ) {
			return (
				<div className="results-container">
					{ results.map( result => {
						console.log(result.location.city);
						return (
							<a key={ result.id } href={ result.url } className="result-item">
								<h6 className="image-username">{result.name}</h6>
								<div className="image-wrapper">
									<img className="image" src={ result.image_url } alt={`${result.name} `}/>
								</div>
							</a>
						)
					} ) }

				</div>
			)
		}
	};

	handleOnInput = ( event ) => {
		const query = event.target.value;
		this.setState( { query : query });
	};

	render() {
		const { query, loading, message } = this.state;

		return (
			<div className="container">
			{/*	Heading*/}
			<h2 className="heading">Plaidypus Code Challenge</h2>
			{/* Search Input*/}
			<label className="search-label test" htmlFor="search-input">
				<input
					type="text"
					name="query"
					value={ query }
					id="search-input"
					placeholder="Search location..."
					onChange={this.handleOnInput}
				/>
				<button className="searchBtn" onClick={this.handleOnInputChange}>Search</button>
			</label>

			{/*	Error Message*/}
				{message && <p className="message">{ message }</p>}

			{/*	Loader*/}
			<img src={ Loader } className={`search-loading ${ loading ? 'show' : 'hide' }`} alt="loader"/>

			{/*	Result*/}
			{ this.renderSearchResults() }

			</div>
		)
	}
}

export default Search
