/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import proptypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import api from '../../services/api';
import {
    Loading,
    Owner,
    IssueList,
    Label,
    IssueFilter,
    Pagination,
} from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
    static propTypes = {
        match: proptypes.shape({
            params: proptypes.shape({
                repository: proptypes.string,
            }),
        }).isRequired,
    };

    state = {
        repository: {},
        issues: [],
        loading: true,
        issueState: 'open',
        page: 1,
    };

    async componentDidMount() {
        const { issueState, page } = this.state;

        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: issueState,
                    per_page: 5,
                    page,
                },
            }),
        ]);

        this.setState({
            loading: false,
            repository: repository.data,
            issues: issues.data,
        });
    }

    handleIssueState = async e => {
        await this.setState({ issueState: e.target.value, page: 1 });
        this.componentDidMount();
    };

    handlePage = async action => {
        const { page } = this.state;
        await this.setState({
            // eslint-disable-next-line no-nested-ternary
            page: action === 'back' ? (page > 0 ? page - 1 : 1) : page + 1,
        });
        this.componentDidMount();
    };

    render() {
        const { repository, issues, loading, page } = this.state;

        if (loading) {
            return <Loading>Carregando</Loading>;
        }

        return (
            <Container>
                <Owner>
                    <Link to="/">Voltar aos repositórios</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>
                <IssueFilter>
                    <p>Mostrar issues </p>
                    <div>
                        <button
                            type="button"
                            value="open"
                            onClick={this.handleIssueState}
                        >
                            Abertas
                        </button>
                        <button
                            type="button"
                            value="closed"
                            onClick={this.handleIssueState}
                        >
                            Fechadas
                        </button>
                        <button
                            type="button"
                            value="all"
                            onClick={this.handleIssueState}
                        >
                            Todas
                        </button>
                    </div>
                </IssueFilter>
                <IssueList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <Label
                                            key={String(label.id)}
                                            color={label.color}
                                        >
                                            {label.name}
                                        </Label>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
                <Pagination>
                    <button
                        type="button"
                        value={page > 1 ? parseInt(page, 0) - 1 : 1}
                        onClick={() => this.handlePage('back')}
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        type="button"
                        value={parseInt(page, 0) + 1}
                        onClick={() => this.handlePage('next')}
                    >
                        <FaChevronRight />
                    </button>
                </Pagination>
            </Container>
        );
    }
}
