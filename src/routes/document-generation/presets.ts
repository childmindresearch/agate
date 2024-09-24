import { Section } from './section';

export const customPreset = new Section({
	title: 'Document Title',
	instructions: 'Document instructions'
});

export const grantProposalPreset = new Section({
	title: 'Title (create one if the user does not modify this)',
	instructions:
		'The user has provided a list of files containing information on the grant they are writing.',
	n_required_files: 1,
	children: [
		new Section({
			title: 'Aims',
			instructions: `The goal is to construct a compelling argument that is very easy to understand and repeat. In practice, this is what will be read most closely, and what will be referred back to when describing the project to other panelists. An important point to remember is that unless a detail (e.g., piece of background, element of the approach) is directly tied to the argument you are making, it should not be included in your aims page. In order to build a compelling argument, you need to:
(Paragraph 1) Clearly state the domain you are thinking about.
(Paragraph 1) Make it crystal clear why this domain is important and impactful.
(Paragraph 1) Point out issues or gaps in the current state-of-the-art in this domain, and expand until you are one argument shy of properly discouraging the reader. Note that every issue or gap you point out should be directly addressed in your aims that come later on.
(Paragraph 1) In one sentence, summarize all of the problems you will solve in your project.
(Paragraph 2) Clearly restate the problem you will solve, with slightly more emphasis on the impact it will have, and how you will accomplish it. This is the guiding light of your grant, and what you are striving towards.
(Paragraph 2) Expand the proposal into components of the solution sequentially. You may include details pertaining to high-level approach (e.g., datasets, communities, or conceptual approaches leveraged), but no in-the-weeds methodological details unless they strengthen the argument for your approach.
(Paragraph 2) Summarize, in one or two strong sentences, the concrete outcomes of your funded and successfully executed project on the field, linking each example to the aims you are about to enumerate in greater detail.
(Paragraph 3) After the aims, tie this section up with an impact sentence that paints a picture of what the scientific landscape will look like for your domain once your project completes.

The aims are the scaffolding of your project. They should complement one another, but be able to be tackled independently, and advanced in parallel to one another — if each aim is a resounding success, those downstream will be improved, not enabled; conversely, if an aim were to fail, it would not disable those downstream. You should have between 2–4 of them, but without numbers exceeding 3 (e.g., if you have 4 aims, at least two should be sub-aims of the same number). In general:
Each must have a title that stands alone as a simple, impactful, and easy to articulate sentence for what the aim will accomplish. The aim title does not need to include methodological details unless the point of innovation for the aim is the methodology.
The brief summary of each aim then restates the core gap being addressed, and how the proposed method solves this problem.
You should include precisely enough methodological details in this section that make it clear that you know how to accomplish the stated aim, but not so much that you invite deep scrutiny on how you will go about it — this is the abstract, not the methods section.
You should conclude each aim statement with a hypothesis and/or clear and measurable outcome. In a perfect world, if the aim is well constructed it should be impossible not to accomplish, i.e., a hypothesis that will surely be tested, or an approach that will be applied, rather than an improvement in baseline performance that may not be reached. This may not be possible for all sorts of projects, but is important to keep in mind when constructing the way that each aim will be evaluated.
As mentioned above, the aims should be related and interconnected, but without dependence upon one another. If two are inextricably linked and one depends upon another, they should be paired sub-aims.
`
		}),
		new Section({
			title: 'Significance and Innovation',
			instructions: `The significance and innovation are where you get the opportunity to make it even more obvious why the problem you’ve chosen to tackle is important, and how your work is different from the rest. These sections should expand elements of your aims that deserve more attention, and should mirror one another closely. The relationships, purpose, and structure of each of these sections are:
Each aim states the work that will be performed and outcome that will be achieved.
The significance section allows you to expand on challenges that exist in each aim (approximately 1–2 per, totally ~5 significance points) and restate in concrete terms why these are impactful gaps, and the impact that your work will have by addressing them. In other words, the significance allows you to provide a deeper and more concretely evidence-backed take on various critical elements of your problem statement, and immediately follow them up with your proposed solutions.
The innovation section then reflects your significance — containing a perfect 1-1 mapping of points in the two, — with an emphasis on how your solution to this problem is novel and moved beyond prior attempts. You restate the solution that your work will produce, and highlight how it exceeds prior art. Importantly, presenting a positive spin on your work, as opposed to a negative spin on the prior work, is important here. You then get to restate the impact of your new solution, and, when possible, highlight other problems that will be unlocked by this innovation.
Put together, you can effectively consider each significance-innovation pair as a complete story arc for one particular element of your proposal. Similar to the aims themselves, the ~5 points that are decided upon to be called out and elaborated upon here should complement one another but not depend on one another. If all elements succeed, the interactions increase the relative strength of each, but if one fails, the others all remain standing.
`
		})
	]
});
